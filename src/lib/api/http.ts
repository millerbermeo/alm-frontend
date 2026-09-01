import axios, { AxiosError, type AxiosRequestConfig } from "axios";

import { ApiError, apiErrorFromResponse } from "@/lib/errors";
import type { ApiEnvelope } from "@/types/api";

/**
 * Browser HTTP client. Talks only to this app's own BFF (`/api/**`), never to
 * the Rust backend directly — the session cookie is httpOnly and same-origin,
 * so `withCredentials` is implicit.
 */
export const http = axios.create({
  baseURL: "/api",
  headers: { Accept: "application/json" },
  timeout: 30_000,
});

http.interceptors.response.use(
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

/** GET returning the unwrapped `data` of the BFF envelope. */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await http.get<ApiEnvelope<T>>(url, config);
  return data.data as T;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.post<ApiEnvelope<T>>(url, body, config);
  return data.data as T;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.patch<ApiEnvelope<T>>(url, body, config);
  return data.data as T;
}

export async function apiDelete<T = void>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.delete<ApiEnvelope<T>>(url, config);
  return (data?.data ?? undefined) as T;
}
