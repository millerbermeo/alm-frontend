import type { ImageListParams } from "@/types/api";

/**
 * Central registry of TanStack Query keys. Every hook imports from here so
 * invalidation stays consistent and typo-free.
 */
export const queryKeys = {
  session: ["session"] as const,

  projects: {
    all: ["projects"] as const,
    list: (params?: { cursor?: string; limit?: number }) =>
      ["projects", "list", params ?? {}] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
  },

  apiKeys: {
    all: ["api-keys"] as const,
    listByProject: (projectId: string) => ["api-keys", "project", projectId] as const,
  },

  folders: {
    all: ["folders"] as const,
    listByProject: (projectId: string, parentId?: string) =>
      ["folders", "project", projectId, parentId ?? null] as const,
    detail: (id: string) => ["folders", "detail", id] as const,
  },

  images: {
    all: ["images"] as const,
    list: (projectId: string, params?: ImageListParams) =>
      ["images", "project", projectId, params ?? {}] as const,
    detail: (projectId: string, id: string) =>
      ["images", "project", projectId, "detail", id] as const,
  },

  imageKey: (projectId: string) => ["image-key", projectId] as const,

  health: ["health"] as const,
} as const;
