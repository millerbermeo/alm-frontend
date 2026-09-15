import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

import { env } from "@/config/env";
import { ApiError, apiErrorFromResponse } from "@/lib/errors";
import * as tokenStorage from "@/lib/auth/token-storage";
import type { ApiEnvelope, TokenPair } from "@/types/api";

/**
 * Browser HTTP client — talks to the Rust API directly (no BFF: this is a
 * static export, there is no server at runtime). The access token is read
 * from `token-storage` and attached per request; a 401 triggers a
 * single-flight silent refresh, mirroring the retry/refresh semantics the
 * old server-side client (`lib/server/rust-api.ts`, pre-static-export) had.
 */
export const http = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: { Accept: "application/json" },
  timeout: 30_000,
});

/** Endpoints that must never carry a stale Authorization header. */
const NO_AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

interface RetryConfig extends InternalAxiosRequestConfig {
  _authRetried?: boolean;
  _429Attempt?: number;
  _networkAttempt?: number;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Max automatic retries on a `429 Too Many Requests` from the backend. */
const MAX_429_RETRIES = 2;
/** Upper bound on how long we'll honour a `Retry-After` before a retry (ms). */
const MAX_RETRY_WAIT_MS = 3_000;
/** Max automatic retries on a transient network failure (blip, backend restart). */
const MAX_NETWORK_RETRIES = 2;

http.interceptors.request.use((config: RetryConfig) => {
  const path = config.url ?? "";
  if (!NO_AUTH_PATHS.some((p) => path.startsWith(p))) {
    const token = tokenStorage.getAccessToken();
    if (token) config.headers.set("authorization", `Bearer ${token}`);
  }
  return config;
});

// --- silent refresh (single-flight per tab) --------------------------------

let refreshInFlight: Promise<TokenPair | null> | null = null;

async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  refreshInFlight ??= (async () => {
    try {
      const res = await axios.post<ApiEnvelope<TokenPair>>(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { Accept: "application/json" }, validateStatus: () => true },
      );
      // `null` means *only* "the refresh token itself is dead" — the caller
      // clears the session on that. A transient failure (5xx, backend down)
      // must NOT log the user out: rethrow it so the request fails loudly
      // and can be retried, session intact.
      if (res.status === 401 || res.status === 403) return null;
      if (res.status < 200 || res.status >= 300) {
        throw apiErrorFromResponse(res.status, res.data);
      }
      const pair = res.data?.data ?? null;
      if (pair) tokenStorage.setTokens(pair);
      return pair;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;

    if (error.response && config) {
      const { status } = error.response;

      // Transient throttle: back off once or twice honouring `Retry-After`.
      if (status === 429 && (config._429Attempt ?? 0) < MAX_429_RETRIES) {
        const attempt = config._429Attempt ?? 0;
        const retryAfter = Number(error.response.headers["retry-after"]);
        const waitMs = Math.min(
          Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 300 * 2 ** attempt,
          MAX_RETRY_WAIT_MS,
        );
        await sleep(waitMs);
        config._429Attempt = attempt + 1;
        return http(config);
      }

      // Silent refresh on 401 — once per request.
      const path = config.url ?? "";
      const isAuthEndpoint = NO_AUTH_PATHS.some((p) => path.startsWith(p));
      if (status === 401 && !isAuthEndpoint && !config._authRetried) {
        config._authRetried = true;
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          tokenStorage.clearTokens();
          return Promise.reject(
            new ApiError({
              status: 401,
              code: "UNAUTHORIZED",
              message: "Your session has expired. Please sign in again.",
            }),
          );
        }
        const refreshed = await refreshAccessToken(refreshToken);
        if (!refreshed) {
          tokenStorage.clearTokens();
          return Promise.reject(
            new ApiError({
              status: 401,
              code: "UNAUTHORIZED",
              message: "Your session has expired. Please sign in again.",
            }),
          );
        }
        config.headers.set("authorization", `Bearer ${refreshed.access_token}`);
        return http(config);
      }

      return Promise.reject(apiErrorFromResponse(status, error.response.data));
    }

    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new ApiError({ status: 408, code: "TIMEOUT", message: "The request timed out." }),
      );
    }

    // Transient network failure (Wi-Fi drop, backend mid-restart): retry a
    // couple times with backoff before giving up — a blip must not read as
    // "session dead" to the caller.
    if (config && (config._networkAttempt ?? 0) < MAX_NETWORK_RETRIES) {
      const attempt = config._networkAttempt ?? 0;
      await sleep(300 * 2 ** attempt);
      config._networkAttempt = attempt + 1;
      return http(config);
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

/** GET returning the unwrapped `data` of the API envelope. */
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
