import { useEffect, useRef, useState } from 'react';
import type { InsightResult } from '@/types/insights';

/**
 * Hook that connects to the /api/insights SSE endpoint.
 * Call `startInsight` with the desired type and payload.
 */
export function useInsights() {
  const [data, setData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startInsight = (type: string, payload: any) => {
    setLoading(true);
    setData('');
    setError(null);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    // POST body for SSE endpoint – we use fetch with POST then switch to EventSource for response.
    fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server responded ${res.status}`);
        }
        // Open an EventSource on the same URL – the server will keep the stream alive.
        const url = new URL('/api/insights', window.location.origin);
        url.searchParams.append('type', type);
        const es = new EventSource(url.toString());
        eventSourceRef.current = es;
        es.onmessage = (e) => {
          setData((prev) => prev + e.data);
        };
        es.onerror = (e) => {
          setError('Connection lost');
          es.close();
          setLoading(false);
        };
        es.onopen = () => {
          // no op – waiting for data
        };
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // When the stream ends, loading becomes false (handled by server closing connection)
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      // poll readyState – if closed, stop loading
      if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
        setLoading(false);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  return { data, loading, error, startInsight };
}
