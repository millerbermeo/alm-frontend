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
  list: (params: ProjectListParams = {}) => apiGet<Page<Project>>("/projects", { params }),

  get: (id: string) => apiGet<Project>(`/projects/${id}`),

  create: (body: CreateProjectBody) => apiPost<Project>("/projects", body),

  update: (id: string, body: UpdateProjectBody) => apiPatch<Project>(`/projects/${id}`, body),

  remove: (id: string) => apiDelete(`/projects/${id}`),
};
