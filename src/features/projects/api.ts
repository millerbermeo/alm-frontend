import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/http";
import type {
  CreateProjectBody,
  Page,
  Project,
  UpdateProjectBody,
} from "@/types/api";

export interface ProjectListParams {
  cursor?: string;
  limit?: number;
}

export const projectsApi = {
  list: (params: ProjectListParams = {}) =>
    apiGet<Page<Project>>("/proxy/projects", { params }),

  get: (id: string) => apiGet<Project>(`/proxy/projects/${id}`),

  create: (body: CreateProjectBody) => apiPost<Project>("/proxy/projects", body),

  update: (id: string, body: UpdateProjectBody) =>
    apiPatch<Project>(`/proxy/projects/${id}`, body),

  remove: (id: string) => apiDelete(`/proxy/projects/${id}`),
};
