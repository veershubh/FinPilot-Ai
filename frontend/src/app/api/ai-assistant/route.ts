// src/app/api/ai-assistant/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import type { AIConversation } from "@/types/ai-assistant";

async function getUserId(request: Request): Promise<string | null> {
  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

// GET – list conversations for the user
export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const supabase = getRouteHandlerSupabase(request);

    const { data, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data as AIConversation[]);
  } catch (e: any) {
    console.error("[api/ai-assistant] GET error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

// POST – create a new conversation
export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const supabase = getRouteHandlerSupabase(request);

    const payload = {
      user_id: userId,
      title: body.title ?? "New Conversation",
    };

    const { data, error } = await supabase
      .from("ai_conversations")
      .insert(payload)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data as AIConversation, { status: 201 });
  } catch (e: any) {
    console.error("[api/ai-assistant] POST error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

// DELETE – delete a conversation
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("id");
    if (!conversationId) return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });

    const supabase = getRouteHandlerSupabase(request);

    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
