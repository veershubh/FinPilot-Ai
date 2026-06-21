// src/app/api/ai-assistant/chat/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";

async function getUserId(request: Request): Promise<string | null> {
  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

/**
 * Fetch user's financial context for the AI system prompt.
 */
async function getFinancialContext(request: Request, userId: string) {
  const supabase = getRouteHandlerSupabase(request);

  const [commitments, assets, liabilities, goals] = await Promise.all([
    supabase.from("commitments").select("title, category, monthly_amount, outstanding_balance, status").eq("user_id", userId).limit(20).then(r => r.data ?? []),
    supabase.from("assets").select("name, category, current_value, invested_value, status").eq("user_id", userId).limit(20).then(r => r.data ?? []),
    supabase.from("liabilities").select("name, category, outstanding_balance, monthly_emi, interest_rate, status").eq("user_id", userId).limit(20).then(r => r.data ?? []),
    supabase.from("financial_goals").select("title, category, target_amount, current_amount, monthly_contribution, priority, status").eq("user_id", userId).limit(20).then(r => r.data ?? []),
  ]);

  const profile = await supabase.from("profiles").select("full_name, monthly_income").eq("id", userId).single().then(r => r.data);

  return { profile, commitments, assets, liabilities, goals };
}

function buildSystemPrompt(context: any): string {
  const parts: string[] = [
    `You are FinPilot AI, a friendly and knowledgeable personal financial advisor. You have access to the user's real financial data. Be concise, actionable, and use Indian Rupee (₹) formatting.`,
    `\n## User Profile`,
    context.profile ? `Name: ${context.profile.full_name || 'User'}, Monthly Income: ₹${context.profile.monthly_income?.toLocaleString('en-IN') || 'Unknown'}` : 'Profile not available.',
  ];

  if (context.assets?.length > 0) {
    const totalAssets = context.assets.reduce((s: number, a: any) => s + (a.current_value || 0), 0);
    parts.push(`\n## Assets (${context.assets.length} items, Total: ₹${totalAssets.toLocaleString('en-IN')})`);
    context.assets.forEach((a: any) => parts.push(`- ${a.name} (${a.category}): ₹${a.current_value?.toLocaleString('en-IN')}`));
  }

  if (context.liabilities?.length > 0) {
    const totalDebt = context.liabilities.reduce((s: number, l: any) => s + (l.outstanding_balance || 0), 0);
    parts.push(`\n## Liabilities (${context.liabilities.length} items, Total Debt: ₹${totalDebt.toLocaleString('en-IN')})`);
    context.liabilities.forEach((l: any) => parts.push(`- ${l.name} (${l.category}): Outstanding ₹${l.outstanding_balance?.toLocaleString('en-IN')}, EMI ₹${l.monthly_emi?.toLocaleString('en-IN')}, Rate ${l.interest_rate}%`));
  }

  if (context.commitments?.length > 0) {
    const totalBurden = context.commitments.reduce((s: number, c: any) => s + (c.monthly_amount || 0), 0);
    parts.push(`\n## Commitments (${context.commitments.length} items, Monthly Burden: ₹${totalBurden.toLocaleString('en-IN')})`);
    context.commitments.forEach((c: any) => parts.push(`- ${c.title} (${c.category}): ₹${c.monthly_amount?.toLocaleString('en-IN')}/mo, Status: ${c.status}`));
  }

  if (context.goals?.length > 0) {
    parts.push(`\n## Financial Goals (${context.goals.length})`);
    context.goals.forEach((g: any) => {
      const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
      parts.push(`- ${g.title} (${g.category}, ${g.priority} priority): ${pct}% complete, Target ₹${g.target_amount?.toLocaleString('en-IN')}`);
    });
  }

  parts.push(`\nRespond naturally. Use bullet points for lists. Keep answers under 300 words unless the user asks for detail. Never reveal raw data structures.`);
  return parts.join('\n');
}

/** Valid commitment categories matching the database enum */
const VALID_CATEGORIES = [
  'phone_emi', 'laptop_emi', 'vehicle_loan', 'home_loan',
  'credit_card_emi', 'insurance', 'sip', 'subscription',
  'education_loan', 'personal_loan', 'family_expense',
  'business_expense', 'other',
] as const;

/**
 * Detect if the user message is a commitment creation intent.
 * Returns true for phrases like "add as commitment", "proceed with this", "save this commitment", etc.
 */
function isCommitmentIntent(message: string): boolean {
  const lower = message.toLowerCase();
  const patterns = [
    /add (this|it) as (a |my )?(commitment|emi)/,
    /proceed (with this|as a commitment)/,
    /save (this|it) as (a |my )?(commitment|emi)/,
    /create (this|a|the) commitment/,
    /confirm (the |this )?(commitment|emi|purchase)/,
    /yes.{0,20}(add|create|save|proceed)/,
    /go ahead.{0,20}(add|create|commitment)/,
    /add (to|as) (my )?commitments/,
    /make (this|it) a commitment/,
    /track (this|it) as (a )?commitment/,
  ];
  return patterns.some(p => p.test(lower));
}

function inferActionType(message: string): "create_commitment" | "create_asset" | "create_liability" | "create_goal" | null {
  const lower = message.toLowerCase();
  const wantsWrite = /add|create|track|save|confirm|go ahead|proceed/.test(lower);
  if (!wantsWrite) return null;
  if (/goal|target|emergency fund|retirement|save for/.test(lower)) return "create_goal";
  if (/asset|investment|fixed deposit|mutual fund|stock|gold|property|crypto|bank account/.test(lower)) return "create_asset";
  if (/liability|debt|loan|credit card/.test(lower)) return "create_liability";
  if (isCommitmentIntent(message) || /emi|commitment|subscription|insurance/.test(lower)) return "create_commitment";
  return null;
}

function extractFirstAmount(message: string): number {
  const normalised = message.replace(/,/g, "");
  const match = normalised.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|cr|crore|crores|k)?/i);
  if (!match) return 0;
  const value = Number(match[1]);
  const unit = match[2]?.toLowerCase();
  if (unit === "k") return value * 1000;
  if (unit === "lakh" || unit === "lakhs" || unit === "lac" || unit === "lacs") return value * 100000;
  if (unit === "cr" || unit === "crore" || unit === "crores") return value * 10000000;
  return value;
}

function extractSimpleActionPayload(
  actionType: "create_asset" | "create_liability" | "create_goal",
  message: string
): Record<string, unknown> | null {
  const amount = extractFirstAmount(message);
  if (amount <= 0) return null;

  const lower = message.toLowerCase();
  const label = message
    .replace(/add|create|track|save|confirm|go ahead|proceed|as an?|my|asset|liability|goal|loan|debt/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  if (actionType === "create_asset") {
    const category =
      /fixed deposit|fd/.test(lower) ? "fixed_deposit" :
      /mutual fund/.test(lower) ? "mutual_fund" :
      /stock|share/.test(lower) ? "stock" :
      /gold/.test(lower) ? "gold" :
      /property|real estate|house/.test(lower) ? "real_estate" :
      /crypto|bitcoin|eth/.test(lower) ? "crypto" :
      /bank|savings account/.test(lower) ? "bank_account" :
      "other";
    return { name: label || "New Asset", category, current_value: amount, invested_value: amount, notes: "Created via AI Assistant" };
  }

  if (actionType === "create_liability") {
    const category =
      /home|house|mortgage/.test(lower) ? "home_loan" :
      /car|auto|vehicle|bike/.test(lower) ? "auto_loan" :
      /education|student/.test(lower) ? "education_loan" :
      /credit card/.test(lower) ? "credit_card" :
      /personal/.test(lower) ? "personal_loan" :
      "other";
    const emiMatch = message.replace(/,/g, "").match(/(?:emi|monthly)\D{0,20}(\d+(?:\.\d+)?)/i);
    return {
      name: label || "New Liability",
      category,
      outstanding_balance: amount,
      original_amount: amount,
      monthly_emi: emiMatch ? Number(emiMatch[1]) : 0,
      notes: "Created via AI Assistant",
    };
  }

  const category =
    /retire/.test(lower) ? "retirement" :
    /emergency/.test(lower) ? "emergency_fund" :
    /debt/.test(lower) ? "debt_payoff" :
    /invest/.test(lower) ? "investment" :
    /education|study/.test(lower) ? "education" :
    /home|house/.test(lower) ? "home" :
    "savings";
  return { title: label || "New Goal", category, target_amount: amount, current_amount: 0, monthly_contribution: 0, priority: "medium", notes: "Created via AI Assistant" };
}

/**
 * Extract commitment data from conversation history using AI.
 * Returns structured data or null if extraction fails.
 */
async function extractCommitmentFromHistory(
  messages: { role: string; content: string }[],
  openaiKey: string | undefined,
  groqKey: string | undefined
): Promise<{
  title: string;
  category: string;
  monthly_amount: number;
  original_amount: number;
  interest_rate: number;
  tenure_months: number;
  provider: string | null;
} | null> {
  const extractionPrompt = `You are a data extraction assistant. Review the conversation and extract commitment/EMI details.

Return ONLY a valid JSON object with these exact fields (no markdown, no explanation):
{
  "title": "descriptive name like iPhone 15 EMI or Home Loan",
  "category": "one of: phone_emi, laptop_emi, vehicle_loan, home_loan, credit_card_emi, insurance, sip, subscription, education_loan, personal_loan, family_expense, business_expense, other",
  "monthly_amount": <number in rupees, required>,
  "original_amount": <total loan/price amount in rupees, 0 if unknown>,
  "interest_rate": <annual % as number, 0 if unknown>,
  "tenure_months": <number of months, 0 if unknown>,
  "provider": "bank or brand name or null"
}

If you cannot extract monthly_amount with confidence, return null.
Conversation to analyze:
${messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n')}`;

  let raw = '';

  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: extractionPrompt }],
          temperature: 0,
          max_tokens: 300,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        raw = data.choices?.[0]?.message?.content ?? '';
      }
    } catch { /* fall through */ }
  }

  if (!raw && groqKey) {
    try {
      const { default: Groq } = await import('groq-sdk');
      const groq = new Groq({ apiKey: groqKey });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: extractionPrompt }],
        temperature: 0,
        max_tokens: 300,
      });
      raw = completion.choices?.[0]?.message?.content ?? '';
    } catch { /* fall through */ }
  }

  if (!raw) return null;

  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    if (cleaned === 'null' || !cleaned) return null;
    const parsed = JSON.parse(cleaned);
    if (!parsed || !parsed.monthly_amount || parsed.monthly_amount <= 0) return null;

    // Validate and normalise category
    const cat = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'other';

    return {
      title: String(parsed.title || 'New Commitment').substring(0, 100),
      category: cat,
      monthly_amount: Number(parsed.monthly_amount) || 0,
      original_amount: Number(parsed.original_amount) || 0,
      interest_rate: Number(parsed.interest_rate) || 0,
      tenure_months: Number(parsed.tenure_months) || 0,
      provider: parsed.provider ? String(parsed.provider).substring(0, 100) : null,
    };
  } catch {
    return null;
  }
}

/**
 * Actually create the commitment in Supabase via the commitments API.
 * Called server-side so it inherits the user's auth cookie.
 */
async function createCommitmentInDB(
  request: Request,
  userId: string,
  commitmentData: {
    title: string;
    category: string;
    monthly_amount: number;
    original_amount: number;
    interest_rate: number;
    tenure_months: number;
    provider: string | null;
  }
): Promise<{ id: string; title: string } | null> {
  const supabase = getRouteHandlerSupabase(request);

  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  let endDate: string | null = null;
  if (commitmentData.tenure_months > 0) {
    const end = new Date(today);
    end.setMonth(end.getMonth() + commitmentData.tenure_months);
    endDate = end.toISOString().split('T')[0];
  }

  const payload = {
    user_id: userId,
    title: commitmentData.title,
    category: commitmentData.category,
    provider: commitmentData.provider,
    description: `Created via AI Assistant`,
    original_amount: commitmentData.original_amount,
    outstanding_balance: commitmentData.original_amount,
    monthly_amount: commitmentData.monthly_amount,
    interest_rate: commitmentData.interest_rate,
    start_date: startDate,
    end_date: endDate,
    next_due_date: startDate,
    progress_percentage: 0,
    months_completed: 0,
    months_remaining: commitmentData.tenure_months,
    status: 'active',
  };

  console.log('[AI Assistant] Creating commitment...', { title: payload.title, monthly_amount: payload.monthly_amount });

  const { data, error } = await supabase
    .from('commitments')
    .insert(payload as any)
    .select('id, title')
    .single();

  if (error) {
    console.error('[AI Assistant] Commitment creation failed:', error.message);
    return null;
  }

  console.log(`[AI Assistant] Commitment created: ${data.id} — "${data.title}"`);
  return { id: data.id, title: data.title };
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await request.json();
    const { conversationId, message } = body;

    if (!conversationId || !message) {
      return NextResponse.json({ error: "Missing conversationId or message" }, { status: 400 });
    }

    const supabase = getRouteHandlerSupabase(request);

    // Save user message
    await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "user",
      content: message,
    });

    // Fetch conversation history (last 20 messages for context)
    const { data: historyData } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const history = (historyData ?? []).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // ── Commitment Intent Detection ─────────────────────────────────────────
    let pendingAction: {
      type: 'pending_action';
      actionType: 'create_commitment' | 'create_asset' | 'create_liability' | 'create_goal';
      label: string;
      payload: Record<string, any>;
    } | null = null;

    const inferredActionType = inferActionType(message);

    if (inferredActionType === "create_commitment") {
      console.log('[AI Assistant] Commitment intent detected, preparing confirmation action...');

      const extracted = await extractCommitmentFromHistory(
        [...history, { role: 'user', content: message }],
        openaiKey,
        groqKey
      );

      if (extracted) {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = extracted.tenure_months > 0
          ? (() => {
              const end = new Date();
              end.setMonth(end.getMonth() + extracted.tenure_months);
              return end.toISOString().split('T')[0];
            })()
          : null;
        pendingAction = {
          type: 'pending_action',
          actionType: 'create_commitment',
          label: `Create commitment: ${extracted.title}`,
          payload: {
            ...extracted,
            description: "Created via AI Assistant",
            start_date: startDate,
            end_date: endDate,
          },
        };
      } else {
        console.log('[AI Assistant] Could not extract enough commitment data from conversation.');
      }
    } else if (inferredActionType) {
      const payload = extractSimpleActionPayload(inferredActionType, message);
      if (payload) {
        const title = String(payload.title ?? payload.name ?? inferredActionType.replace("create_", ""));
        pendingAction = {
          type: 'pending_action',
          actionType: inferredActionType,
          label: `Create ${inferredActionType.replace("create_", "")}: ${title}`,
          payload,
        };
      }
    }

    // ── Generate assistant reply ────────────────────────────────────────────
    const context = await getFinancialContext(request, userId);
    const systemPrompt = buildSystemPrompt(context);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history,
      { role: 'user' as const, content: message },
    ];

    let assistantContent = '';

    // If an action was detected, ask the user to confirm before writing data.
    if (pendingAction) {
      assistantContent = `I found an action I can do for you:

**${pendingAction.label}**

Please review it and confirm. I will only update your FinPilot records after you click Confirm.`;
    } else {
      // Normal AI response
      if (openaiKey) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
            body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.3, max_tokens: 1000 }),
          });
          if (response.ok) {
            const data = await response.json();
            assistantContent = data.choices?.[0]?.message?.content ?? '';
          } else {
            console.warn("[ai-chat] OpenAI failed, trying Groq...");
          }
        } catch { /* fall through */ }
      }

      if (!assistantContent && groqKey) {
        try {
          const { default: Groq } = await import('groq-sdk');
          const groq = new Groq({ apiKey: groqKey });
          const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: messages as any,
            temperature: 0.3,
            max_tokens: 1000,
          });
          assistantContent = completion.choices?.[0]?.message?.content ?? '';
        } catch (groqErr) {
          console.warn("[ai-chat] Groq failed:", groqErr);
        }
      }

      if (!assistantContent) {
        // Mock fallback — check if the user seems to want a commitment but AI keys aren't configured
        if (isCommitmentIntent(message)) {
          assistantContent = `I understood you want to add a commitment, but I need more details to extract the exact figures. Could you please tell me:
• **Product/loan name** (e.g., "iPhone 15 EMI", "Home Loan")
• **Monthly EMI amount** (₹)
• **Total loan/price amount** (₹)
• **Tenure** (number of months)
• **Interest rate** (% per annum, if applicable)

Once you provide these, I'll add it to your commitments.`;
        } else {
          const totalAssets = context.assets?.reduce((s: number, a: any) => s + (a.current_value || 0), 0) ?? 0;
          const totalDebt = context.liabilities?.reduce((s: number, l: any) => s + (l.outstanding_balance || 0), 0) ?? 0;
          const netWorth = totalAssets - totalDebt;

          assistantContent = `Hey there! 👋 I'm FinPilot AI, your personal financial advisor.

Here's a quick snapshot of your finances:
• **Total Assets**: ₹${totalAssets.toLocaleString('en-IN')}
• **Total Liabilities**: ₹${totalDebt.toLocaleString('en-IN')}
• **Net Worth**: ₹${netWorth.toLocaleString('en-IN')}
• **Active Commitments**: ${context.commitments?.length ?? 0}
• **Financial Goals**: ${context.goals?.length ?? 0}

*Note: For more detailed AI-powered analysis, connect an OpenAI or Groq API key.*

How can I help you with your finances today?`;
        }
      }
    }

    // Save assistant message
    await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "assistant",
      content: assistantContent,
    });

    // Update conversation title
    if (history.length <= 1) {
      const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
      await supabase.from("ai_conversations").update({ title, updated_at: new Date().toISOString() }).eq("id", conversationId);
    } else {
      await supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
    }

    return NextResponse.json({
      content: assistantContent,
      ...(pendingAction ? { action: pendingAction } : {}),
    });
  } catch (e: any) {
    console.error("[api/ai-assistant/chat] error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

// GET – fetch messages for a conversation
export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });

    const supabase = getRouteHandlerSupabase(request);

    const { data, error } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
