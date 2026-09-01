import "server-only";

import { env } from "@/config/env";
import { ApiError, apiErrorFromResponse } from "@/lib/errors";
import type { ApiEnvelope, TokenPair } from "@/types/api";
import {
  readTokens,
  writeAccessToken,
  clearSession,
} from "@/lib/server/session";

const API_PREFIX = "/api/v1";

export interface RustRequest {
  path: string; // e.g. "/projects" — API_PREFIX is prepended
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  searchParams?: Record<string, string | number | undefined | null>;
  /** JSON body (object) or a raw BodyInit (FormData / stream) for uploads. */
  body?: unknown;
  headers?: Record<string, string>;
  /** Bypass the Next data cache — always true for this dynamic admin data. */
  signal?: AbortSignal;
}

export interface RustResponse {
  status: number;
  ok: boolean;
  headers: Headers;
  /** Parsed JSON body (envelope) when the response was JSON, else `null`. */
  json: unknown;
}

function buildUrl(path: string, searchParams?: RustRequest["searchParams"]): string {
  const url = new URL(API_PREFIX + path, env.RUST_API_URL);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function isRawBody(body: unknown): body is BodyInit {
  return (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams ||
    typeof body === "string"
  );
}

/** Max automatic retries on a `429 Too Many Requests` from the backend. */
const MAX_429_RETRIES = 2;
/** Upper bound on how long we'll honour a `Retry-After` before a retry (ms). */
const MAX_RETRY_WAIT_MS = 3_000;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function doFetch(
  req: RustRequest,
  accessToken?: string,
  attempt = 0,
): Promise<RustResponse> {
  const headers = new Headers(req.headers);
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  let payload: BodyInit | undefined;
  if (req.body !== undefined) {
    if (isRawBody(req.body)) {
      payload = req.body;
    } else {
      headers.set("content-type", "application/json");
      payload = JSON.stringify(req.body);
    }
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(req.path, req.searchParams), {
      method: req.method ?? "GET",
      headers,
      body: payload,
      cache: "no-store",
      signal: req.signal,
    });
  } catch {
    throw new ApiError({
      status: 502,
      code: "BACKEND_UNREACHABLE",
      message: "The image service is unreachable. Please try again shortly.",
    });
  }

  // Transient throttle: back off once or twice honouring `Retry-After`, then
  // let the 429 through so the caller can surface it.
  if (res.status === 429 && attempt < MAX_429_RETRIES && !req.signal?.aborted) {
    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs = Math.min(
      Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 300 * 2 ** attempt,
      MAX_RETRY_WAIT_MS,
    );
    await sleep(waitMs);
    return doFetch(req, accessToken, attempt + 1);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const json = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : null;

  return { status: res.status, ok: res.ok, headers: res.headers, json };
}

// --- silent refresh (single-flight per process) ---------------------------

let refreshInFlight: Promise<TokenPair | null> | null = null;

async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  refreshInFlight ??= (async () => {
    try {
      const res = await doFetch({
        path: "/auth/refresh",
        method: "POST",
        body: { refresh_token: refreshToken },
      });
      // `null` means *only* "the refresh token itself is dead" — the caller
      // clears the session on that. A transient failure (429 after retries,
      // 5xx, backend down) must NOT log the user out: rethrow it so the
      // request fails loudly and can be retried, session intact.
      if (res.status === 401 || res.status === 403) return null;
      if (!res.ok) throw apiErrorFromResponse(res.status, res.json);
      const pair = (res.json as ApiEnvelope<TokenPair>)?.data ?? null;
      if (pair) {
        // Best-effort: persisting cookies only works inside a Route Handler /
        // Server Action. In a Server Component this throws and is ignored;
        // the client's next `/api/auth/session` call re-persists.
        try {
          await writeAccessToken(pair);
        } catch {
          /* not in a mutable-cookie scope */
        }
      }
      return pair;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/**
 * Perform an authenticated call to the Rust API using the session cookies.
 * Transparently refreshes the access token once on a 401.
 */
export async function rustFetchAuthed(req: RustRequest): Promise<RustResponse> {
  const tokens = await readTokens();
  if (!tokens) {
    throw new ApiError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please sign in again.",
    });
  }

  let res = await doFetch(req, tokens.accessToken || undefined);
  if (res.status !== 401) return res;

  const refreshed = await refreshAccessToken(tokens.refreshToken);
  if (!refreshed) {
    try {
      await clearSession();
    } catch {
      /* ignore */
    }
    throw new ApiError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please sign in again.",
    });
  }

  res = await doFetch(req, refreshed.access_token);
  return res;
}

/** Unauthenticated call (login, register, refresh, health). */
export function rustFetch(req: RustRequest): Promise<RustResponse> {
  return doFetch(req);
}

/** Extract `.data` from an envelope response or throw a normalised {@link ApiError}. */
export function unwrap<T>(res: RustResponse): T {
  if (res.ok) {
    const body = res.json as ApiEnvelope<T> | null;
    return (body?.data ?? null) as T;
  }
  throw apiErrorFromResponse(res.status, res.json);
}
