import { getSupabase } from '@/lib/supabaseClient';
import type { AIInsight, AIInsightInsert } from '@/types/database';

/** Fetch recent AI insights for a user (limit 5) */
export const fetchAIInsights = async (userId: string, limit: number = 5) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('ai_insights')
    .select('id, user_id, title, description, confidence_score, severity, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as AIInsight[];
};

/** Insert a new AI insight (admin/automated flow) */
export const insertAIInsight = async (insight: AIInsightInsert) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('ai_insights').insert(insight).select();
  if (error) throw error;
  return data[0] as AIInsight;
};
