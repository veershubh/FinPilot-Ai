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

    // Fetch financial context
    const context = await getFinancialContext(request, userId);
    const systemPrompt = buildSystemPrompt(context);

    // Build messages array
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history,
    ];

    // Try OpenAI first, then Groq, then mock
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    let assistantContent = '';

    if (openaiKey) {
      // OpenAI streaming
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        assistantContent = data.choices?.[0]?.message?.content ?? 'I could not generate a response.';
      } else {
        console.warn("[ai-chat] OpenAI failed, trying Groq...");
      }
    }

    if (!assistantContent && groqKey) {
      // Groq fallback
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
      // Mock fallback
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

*Note: For more detailed AI-powered analysis, connect an OpenAI or Groq API key. I'll still do my best with the data I have!*

How can I help you with your finances today?`;
    }

    // Save assistant message
    await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "assistant",
      content: assistantContent,
    });

    // Update conversation title from first user message
    if (history.length <= 1) {
      const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
      await supabase
        .from("ai_conversations")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    } else {
      await supabase
        .from("ai_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    }

    return NextResponse.json({ content: assistantContent });
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
