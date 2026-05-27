import { getSupabase } from '@/lib/supabaseClient';
import type { Subscription, SubscriptionInsert, SubscriptionUpdate } from '@/types/database';

/** Fetch all subscriptions for a user */
export const fetchSubscriptions = async (userId: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, name, amount, renewal_date, category, created_at')
    .eq('user_id', userId);
  if (error) throw error;
  return data as Subscription[];
};

/** Insert a new subscription */
export const insertSubscription = async (sub: SubscriptionInsert) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('subscriptions').insert(sub).select();
  if (error) throw error;
  return data[0] as Subscription;
};

/** Update a subscription */
export const updateSubscription = async (id: string, updates: SubscriptionUpdate) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as Subscription;
};

/** Delete a subscription */
export const deleteSubscription = async (id: string) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);
  if (error) throw error;
  return true;
};
