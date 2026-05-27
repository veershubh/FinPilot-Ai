import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { GoalInsert, GoalUpdate } from '@/types/database';
import { getMockGoals } from '@/lib/mockData';

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
  return { userId: user.id };
}

export async function GET(request: Request) {
  try {
    const { userId } = await getAuth(request);
    return NextResponse.json(getMockGoals(userId));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await getAuth(request);
    const body: GoalInsert = await request.json();
    const created = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: body.title,
      target_amount: body.target_amount,
      current_amount: body.current_amount ?? 0,
      target_date: body.target_date ?? null,
      created_at: new Date().toISOString(),
    };
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await getAuth(request);
    const { id, ...updates }: { id: string } & GoalUpdate = await request.json();
    const updated = {
      id,
      user_id: userId,
      title: updates.title ?? 'Updated Goal',
      target_amount: updates.target_amount ?? 0,
      current_amount: updates.current_amount ?? 0,
      target_date: updates.target_date ?? null,
      created_at: new Date().toISOString(),
    };
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    await getAuth(request);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
