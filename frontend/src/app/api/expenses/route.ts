import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { ExpenseInsert, ExpenseUpdate } from '@/types/database';
import { getMockExpenses } from '@/lib/mockData';

const getUserId = async (request: Request) => {
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
  return user.id;
};

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);
    return NextResponse.json(getMockExpenses(userId));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    const expense: ExpenseInsert = await request.json();
    const created = {
      id: crypto.randomUUID(),
      user_id: userId,
      category: expense.category,
      amount: expense.amount,
      description: expense.description ?? null,
      expense_date: expense.expense_date ?? new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId(request);
    const { id, updates }: { id: number; updates: ExpenseUpdate } = await request.json();
    const updated = {
      id,
      user_id: userId,
      category: updates.category ?? 'Miscellaneous',
      amount: updates.amount ?? 0,
      description: updates.description ?? null,
      expense_date: updates.expense_date ?? new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    await getUserId(request);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
