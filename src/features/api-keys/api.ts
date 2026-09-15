import { apiDelete, apiGet, apiPost } from "@/lib/api/http";
import type { ApiKeySecret, ApiKeyView, CreateApiKeyBody } from "@/types/api";

export const apiKeysApi = {
  listByProject: (projectId: string) => apiGet<ApiKeyView[]>(`/projects/${projectId}/api-keys`),

  create: (projectId: string, body: CreateApiKeyBody) =>
    apiPost<ApiKeySecret>(`/projects/${projectId}/api-keys`, body),

  revoke: (id: string) => apiPost<null>(`/api-keys/${id}/revoke`),

  rotate: (id: string, graceSeconds = 0) =>
    apiPost<ApiKeySecret>(`/api-keys/${id}/rotate`, { grace_seconds: graceSeconds }),

  remove: (id: string) => apiDelete(`/api-keys/${id}`),
};
