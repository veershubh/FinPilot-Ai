import { useEffect, useRef, useState } from 'react';
import type { InsightResult } from '@/types/insights';

export function useInsights() {
  const [data, setData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Abort controller to cancel ongoing fetch
  const abortControllerRef = useRef<AbortController | null>(null);

  const startInsight = async (type: string, payload: any) => {
    setLoading(true);
    setData('');
    setError(null);

    // Cancel any previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server responded ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setData((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount – abort any in‑flight request
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { data, loading, error, startInsight };
}
