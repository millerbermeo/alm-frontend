import "server-only";

import { cookies } from "next/headers";

import { env } from "@/config/env";
import {
  ACCESS_COOKIE_MAX_AGE,
  COOKIE,
  REFRESH_COOKIE_MAX_AGE,
} from "@/config/constants";
import type { TokenPair } from "@/types/api";

/**
 * Session lives entirely in httpOnly cookies set by this BFF. The browser
 * never sees the Rust access/refresh tokens; it only holds an opaque cookie.
 */

const baseCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.COOKIE_SECURE,
  path: "/",
} as const;

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export async function readTokens(): Promise<SessionTokens | null> {
  const jar = await cookies();
  const accessToken = jar.get(COOKIE.access)?.value;
  const refreshToken = jar.get(COOKIE.refresh)?.value;
  if (!refreshToken) return null;
  return { accessToken: accessToken ?? "", refreshToken };
}

export async function readRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE.refresh)?.value ?? null;
}

/** Persist a fresh {@link TokenPair} from `/auth/login|register|refresh`. */
export async function writeTokens(pair: TokenPair): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE.access, pair.access_token, {
    ...baseCookie,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
  jar.set(COOKIE.refresh, pair.refresh_token, {
    ...baseCookie,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

/** Update only the access-token cookie (used after a silent refresh). */
export async function writeAccessToken(pair: TokenPair): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE.access, pair.access_token, {
    ...baseCookie,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
  jar.set(COOKIE.refresh, pair.refresh_token, {
    ...baseCookie,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE.access);
  jar.delete(COOKIE.refresh);
  jar.delete(COOKIE.imageKeys);
}

/** Cheap check for `proxy.ts` — presence of a refresh cookie. */
export async function hasSessionCookie(): Promise<boolean> {
  const jar = await cookies();
  return Boolean(jar.get(COOKIE.refresh)?.value);
}
