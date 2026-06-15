import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { streamInsight } from '@/lib/ai';

/** GET /api/insights — not supported, insights use POST with SSE streaming */
export async function GET() {
  return NextResponse.json(
    { error: "Use POST to generate insights. GET is not supported.", methods: ["POST"] },
    { status: 405, headers: { Allow: "POST" } }
  );
}

/** Helper to get Supabase client and authenticated user ID */
async function getAuth(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get('cookie');
          if (!cookieHeader) return [];
          return cookieHeader.split('; ').map((c) => {
            const [name, ...rest] = c.split('=');
            return { name, value: rest.join('=') };
          });
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  return { supabase, userId: user.id };
}

/** POST /api/insights – streams AI financial insight */
export async function POST(request: Request) {
  try {
    const { userId } = await getAuth(request);
    const { type, payload } = await request.json();
    if (!type) {
      return NextResponse.json({ error: 'Missing insight type' }, { status: 400 });
    }

    const stream = await streamInsight(type, payload, userId);

    // Return Server‑Sent Events (SSE) style stream
    return new NextResponse(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (e: any) {
    const status = e.message === 'Unauthenticated' ? 401 : 400;
    return NextResponse.json({ error: e.message }, { status });
  }
}
