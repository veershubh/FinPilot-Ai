// src/hooks/useSupabaseQuery.ts

import useSWR, { SWRConfiguration } from 'swr';

/**
 * Generic hook for data fetching with SWR.
 * Pass a unique key and an async fetcher that returns the data.
 * The hook returns { data, error, isLoading, mutate }.
 */
export function useSupabaseQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  config?: SWRConfiguration
) {
  const { data, error, isLoading, mutate } = useSWR<T>(key, fetcher, {
    revalidateOnFocus: false,
    ...config,
  });
  return {
    data,
    error,
    isLoading: isLoading ?? !data,
    mutate,
  };
}
