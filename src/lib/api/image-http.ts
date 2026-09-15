import axios, { AxiosError, type AxiosRequestConfig } from "axios";

import { env } from "@/config/env";
import { ApiError, apiErrorFromResponse } from "@/lib/errors";
import type { ApiEnvelope } from "@/types/api";

/**
 * Client for the `/images` surface, which authenticates with a per-project
 * image API key rather than the panel JWT — so unlike `lib/api/http.ts`
 * there is no fixed Authorization header; each caller passes the key for the
 * project it's acting on via {@link imageAuthConfig}.
 */
export const imageHttp = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: { Accept: "application/json" },
  timeout: 30_000,
});

imageHttp.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      return Promise.reject(apiErrorFromResponse(error.response.status, error.response.data));
    }
    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new ApiError({ status: 408, code: "TIMEOUT", message: "The request timed out." }),
      );
    }
    return Promise.reject(
      new ApiError({
        status: 0,
        code: "NETWORK_ERROR",
        message: "Network error. Check your connection and try again.",
      }),
    );
  },
);

/** `Authorization: Bearer <key>` header for a request scoped to `key`. */
export function imageAuthConfig(key: string, config?: AxiosRequestConfig): AxiosRequestConfig {
  return {
    ...config,
    headers: { ...config?.headers, authorization: `Bearer ${key}` },
  };
}

export async function imageGet<T>(url: string, key: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await imageHttp.get<ApiEnvelope<T>>(url, imageAuthConfig(key, config));
  return data.data as T;
}

export async function imagePost<T>(
  url: string,
  key: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await imageHttp.post<ApiEnvelope<T>>(url, body, imageAuthConfig(key, config));
  return data.data as T;
}

export async function imagePatch<T>(
  url: string,
  key: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await imageHttp.patch<ApiEnvelope<T>>(url, body, imageAuthConfig(key, config));
  return data.data as T;
}

export async function imageDelete<T = void>(
  url: string,
  key: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await imageHttp.delete<ApiEnvelope<T>>(url, imageAuthConfig(key, config));
  return (data?.data ?? undefined) as T;
}
