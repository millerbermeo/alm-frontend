import { QueryClient, isServer } from "@tanstack/react-query";

import { ApiError } from "@/lib/errors";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          // Transient failures (network blip, BFF/backend unreachable) get a
          // few retries with backoff — a dropped connection must not read as
          // "session dead". Real auth/validation errors (401/403/4xx) never retry.
          if (error instanceof ApiError) {
            const isTransient = error.status === 0 || error.status >= 500;
            return isTransient && failureCount < 3;
          }
          return failureCount < 1;
        },
        retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 5_000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/** One client per server render; a single shared client in the browser. */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
