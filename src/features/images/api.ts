import type { AxiosProgressEvent } from "axios";

import { apiDelete, apiGet, apiPatch, apiPost, http } from "@/lib/api/http";
import type {
  ApiEnvelope,
  ImageListParams,
  ImageView,
  Page,
  UpdateImageBody,
} from "@/types/api";

export interface ImageKeyStatus {
  configured: boolean;
  name?: string;
  permissions?: string[];
}

export const imageKeyApi = {
  status: (projectId: string) => apiGet<ImageKeyStatus>(`/image-keys/${projectId}`),
  configure: (projectId: string, secret: string) =>
    apiPost<ImageKeyStatus>(`/image-keys/${projectId}`, { secret }),
  remove: (projectId: string) => apiDelete<ImageKeyStatus>(`/image-keys/${projectId}`),
};

export const imagesApi = {
  list: (projectId: string, params: ImageListParams = {}) =>
    apiGet<Page<ImageView>>(`/images/${projectId}`, { params }),

  get: (projectId: string, id: string) => apiGet<ImageView>(`/images/${projectId}/${id}`),

  upload: (
    projectId: string,
    form: FormData,
    onProgress?: (e: AxiosProgressEvent) => void,
  ) =>
    http
      .post<ApiEnvelope<ImageView>>(`/images/${projectId}`, form, {
        onUploadProgress: onProgress,
      })
      .then((r) => r.data.data as ImageView),

  update: (projectId: string, id: string, body: UpdateImageBody) =>
    apiPatch<ImageView>(`/images/${projectId}/${id}`, body),

  remove: (projectId: string, id: string) => apiDelete(`/images/${projectId}/${id}`),
};
