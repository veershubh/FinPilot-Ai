// src/hooks/useRealtimeSubscription.ts

import { useEffect, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Hook to subscribe to a Supabase realtime channel.
 * Returns the latest payload received and a loading state.
 */
export function useRealtimeSubscription<T>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' = 'INSERT',
  filterColumn?: string,
  filterValue?: string
) {
  const [payload, setPayload] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    let channel: RealtimeChannel = supabase.channel('public:' + table);
    let filter = '';
    if (filterColumn && filterValue) {
      filter = `&${filterColumn}=eq.${filterValue}`;
    }
    channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table, filter },
        (payload) => {
          setPayload(payload.new as T);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setLoading(false);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filterColumn, filterValue]);

  return { payload, loading };
}
