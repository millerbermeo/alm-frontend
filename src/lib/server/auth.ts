import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { ApiError } from "@/lib/errors";
import { rustFetchAuthed, unwrap } from "@/lib/server/rust-api";
import type { UserView } from "@/types/api";

/**
 * Current panel user, or `null` when unauthenticated. `cache()` dedupes the
 * `/auth/me` call across a single server render (layout + page + generateMetadata).
 */
export const getCurrentUser = cache(async (): Promise<UserView | null> => {
  try {
    const res = await rustFetchAuthed({ path: "/auth/me" });
    if (res.status === 401) return null;
    return unwrap<UserView>(res);
  } catch (err) {
    if (err instanceof ApiError && err.isUnauthorized) return null;
    throw err;
  }
});

/**
 * Redirect unless authenticated. Returns the user otherwise.
 *
 * A `null` here means the session is genuinely dead (no cookie, or the refresh
 * token was rejected) — transient backend failures throw instead and surface
 * as an error page. We route through `/api/auth/logout` rather than straight
 * to `/login` so the stale refresh cookie is cleared; otherwise `proxy.ts`
 * bounces `/login → /dashboard` on the still-present cookie, forever.
 */
export async function requireUser(): Promise<UserView> {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/logout");
  return user;
}

export function canAdminister(user: Pick<UserView, "role">): boolean {
  return user.role === "SUPER_ADMIN" || user.role === "ADMIN";
}

/** Redirect to /login when unauthenticated, /dashboard when not an admin. */
export async function requireAdmin(): Promise<UserView> {
  const user = await requireUser();
  if (!canAdminister(user)) redirect(ROUTES.dashboard);
  return user;
}
