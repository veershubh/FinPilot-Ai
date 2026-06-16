// src/app/api/profiles/route.ts

import { NextResponse } from 'next/server';
import type { ProfileInsert, ProfileUpdate } from '@/types/database';
import { getRouteHandlerSupabase } from '@/utils/supabase/server';

/** Helper to retrieve Supabase client + current user */
const getAuth = async (request: Request) => {
  const supabase = getRouteHandlerSupabase(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  return { supabase, userId: user.id };
};

export async function GET(request: Request) {
  try {
    const { supabase, userId } = await getAuth(request);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (e: any) {
    if (e.message === 'Unauthenticated') return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, userId } = await getAuth(request);
    const profile: ProfileInsert = await request.json();
    profile.id = userId;
    const { data, error } = await supabase.from('profiles').insert(profile).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    if (e.message === 'Unauthenticated') return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { supabase, userId } = await getAuth(request);
    const updates: ProfileUpdate = await request.json();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (e: any) {
    if (e.message === 'Unauthenticated') return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { supabase, userId } = await getAuth(request);
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === 'Unauthenticated') return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

