import { getSupabase } from '@/lib/supabaseClient';
import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/database';

/** Fetch the current user's profile */
export async function getProfile(): Promise<Profile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single();
  if (error) {
    console.error('Error fetching profile', error);
    return null;
  }
  return data as Profile;
}

/** Insert a new profile – used by the auto‑create trigger, but also handy for manual seeding */
export async function createProfile(insert: ProfileInsert): Promise<Profile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('profiles').insert(insert).select().single();
  if (error) {
    console.error('Error creating profile', error);
    return null;
  }
  return data as Profile;
}

/** Update current user's profile */
export async function updateProfile(update: ProfileUpdate): Promise<Profile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .select()
    .single();
  if (error) {
    console.error('Error updating profile', error);
    return null;
  }
  return data as Profile;
}
