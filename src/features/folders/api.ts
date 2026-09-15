import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/http";
import type { CreateFolderBody, Folder, UpdateFolderBody } from "@/types/api";

export const foldersApi = {
  listByProject: (projectId: string, parentId?: string) =>
    apiGet<Folder[]>("/folders", {
      params: { project_id: projectId, ...(parentId ? { parent_id: parentId } : {}) },
    }),

  create: (body: CreateFolderBody) => apiPost<Folder>("/folders", body),

  rename: (id: string, body: UpdateFolderBody) => apiPatch<Folder>(`/folders/${id}`, body),

  remove: (id: string) => apiDelete(`/folders/${id}`),
};
