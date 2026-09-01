"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/toast";
import { apiKeysApi } from "@/features/api-keys/api";
import type { CreateApiKeyBody } from "@/types/api";

export function useApiKeys(projectId: string) {
  return useQuery({
    queryKey: queryKeys.apiKeys.listByProject(projectId),
    queryFn: () => apiKeysApi.listByProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateApiKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateApiKeyBody) => apiKeysApi.create(projectId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.apiKeys.listByProject(projectId) });
    },
    onError: (err) => toast.error(err),
  });
}

export function useRevokeApiKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeysApi.revoke(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.apiKeys.listByProject(projectId) });
      toast.success("API key revoked");
    },
    onError: (err) => toast.error(err),
  });
}

export function useRotateApiKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeysApi.rotate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.apiKeys.listByProject(projectId) });
    },
    onError: (err) => toast.error(err),
  });
}

export function useDeleteApiKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeysApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.apiKeys.listByProject(projectId) });
      toast.success("API key deleted");
    },
    onError: (err) => toast.error(err),
  });
}
