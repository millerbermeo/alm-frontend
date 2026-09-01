import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/http";
import type { CreateFolderBody, Folder, UpdateFolderBody } from "@/types/api";

export const foldersApi = {
  listByProject: (projectId: string, parentId?: string) =>
    apiGet<Folder[]>("/proxy/folders", {
      params: { project_id: projectId, ...(parentId ? { parent_id: parentId } : {}) },
    }),

  create: (body: CreateFolderBody) => apiPost<Folder>("/proxy/folders", body),

  rename: (id: string, body: UpdateFolderBody) => apiPatch<Folder>(`/proxy/folders/${id}`, body),

  remove: (id: string) => apiDelete(`/proxy/folders/${id}`),
};
