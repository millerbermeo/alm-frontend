import type { AxiosProgressEvent } from "axios";

import { ApiError } from "@/lib/errors";
import { imageDelete, imageGet, imageHttp, imagePatch, imageAuthConfig } from "@/lib/api/image-http";
import * as tokenStorage from "@/lib/auth/token-storage";
import { apiKeysApi } from "@/features/api-keys/api";
import type { ApiEnvelope, ImageListParams, ImageView, Page, UpdateImageBody } from "@/types/api";

export interface ImageKeyStatus {
  configured: boolean;
  name?: string;
  permissions?: string[];
}

const KEY_RE = /^img_(live|test)_[0-9a-f]{40}$/;

function keyOr409(projectId: string): string {
  const key = tokenStorage.getImageKey(projectId);
  if (!key) {
    throw new ApiError({
      status: 409,
      code: "IMAGE_KEY_MISSING",
      message: "No image API key is configured for this project.",
    });
  }
  return key;
}

export const imageKeyApi = {
  status: (projectId: string): Promise<ImageKeyStatus> =>
    Promise.resolve({ configured: Boolean(tokenStorage.getImageKey(projectId)) }),

  /**
   * Validate the pasted key belongs to this project, works, and has
   * `images:read`; then store it (this browser's `localStorage` — there is
   * no server to keep it encrypted server-side in a static export).
   */
  configure: async (projectId: string, secretInput: string): Promise<ImageKeyStatus> => {
    const secret = secretInput.trim();
    if (!KEY_RE.test(secret)) {
      throw new ApiError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: "That doesn't look like a valid API key (img_live_… / img_test_…).",
      });
    }

    // 1. Confirm the key belongs to THIS project (prefix match against the list).
    const prefix = secret.slice(0, "img_live_".length + 12);
    const keys = await apiKeysApi.listByProject(projectId);
    const match = keys.find((k) => k.key_prefix === prefix);
    if (!match) {
      throw new ApiError({
        status: 400,
        code: "KEY_NOT_IN_PROJECT",
        message: "This key does not belong to this project.",
      });
    }
    if (!match.is_active) {
      throw new ApiError({
        status: 400,
        code: "KEY_INACTIVE",
        message: "This key is revoked or expired.",
      });
    }
    if (!match.permissions.includes("images:read")) {
      throw new ApiError({
        status: 400,
        code: "KEY_MISSING_READ",
        message: "This key needs the images:read permission to be used by the panel.",
      });
    }

    // 2. Live check.
    await imageHttp
      .get<ApiEnvelope<Page<ImageView>>>("/images", imageAuthConfig(secret, { params: { limit: 1 } }))
      .catch(() => {
        throw new ApiError({
          status: 400,
          code: "KEY_REJECTED",
          message: "The backend rejected this key.",
        });
      });

    tokenStorage.setImageKey(projectId, secret);
    return { configured: true, permissions: match.permissions, name: match.name };
  },

  remove: (projectId: string): Promise<ImageKeyStatus> => {
    tokenStorage.clearImageKey(projectId);
    return Promise.resolve({ configured: false });
  },
};

export const imagesApi = {
  list: (projectId: string, params: ImageListParams = {}) =>
    imageGet<Page<ImageView>>("/images", keyOr409(projectId), { params }),

  get: (projectId: string, id: string) => imageGet<ImageView>(`/images/${id}`, keyOr409(projectId)),

  upload: (projectId: string, form: FormData, onProgress?: (e: AxiosProgressEvent) => void) =>
    imageHttp
      .post<ApiEnvelope<ImageView>>(
        "/images",
        form,
        imageAuthConfig(keyOr409(projectId), { onUploadProgress: onProgress }),
      )
      .then((r) => r.data.data as ImageView),

  update: (projectId: string, id: string, body: UpdateImageBody) =>
    imagePatch<ImageView>(`/images/${id}`, keyOr409(projectId), body),

  remove: (projectId: string, id: string) => imageDelete(`/images/${id}`, keyOr409(projectId)),
};
