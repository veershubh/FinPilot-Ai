import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { EMIPlanInsert, EMIPlanUpdate } from '@/types/database';
import { getMockEMIPlans } from '@/lib/mockData';

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
    return NextResponse.json(getMockEMIPlans(userId));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await getAuth(request);
    const body: EMIPlanInsert = await request.json();
    const created = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: body.title ?? 'New EMI Plan',
      principal: body.principal,
      interest_rate: body.interest_rate,
      tenure_months: body.tenure_months,
      emi_amount: body.emi_amount,
      start_date: body.start_date ?? new Date().toISOString(),
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
    const { id, ...updates }: { id: string } & EMIPlanUpdate = await request.json();
    const updated = {
      id,
      user_id: userId,
      title: updates.title ?? 'Updated EMI Plan',
      principal: updates.principal ?? 0,
      interest_rate: updates.interest_rate ?? 0,
      tenure_months: updates.tenure_months ?? 0,
      emi_amount: updates.emi_amount ?? 0,
      start_date: updates.start_date ?? new Date().toISOString(),
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
