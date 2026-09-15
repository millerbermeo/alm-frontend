"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { getBackendStatus } from "@/features/health/api";

export function useBackendStatus() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: getBackendStatus,
    staleTime: 30_000,
  });
}
