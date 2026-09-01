import { type NextRequest, NextResponse } from "next/server";

import { ROUTES } from "@/config/constants";
import { errorJson } from "@/lib/server/auth-routes";
import { rustFetch } from "@/lib/server/rust-api";
import { clearSession, readRefreshToken } from "@/lib/server/session";

/**
 * Best-effort backend logout (revokes the refresh token server-side), then
 * always clears the local session cookies.
 */
export async function POST() {
  try {
    const refreshToken = await readRefreshToken();
    if (refreshToken) {
      await rustFetch({
        path: "/auth/logout",
        method: "POST",
        body: { refresh_token: refreshToken, all_sessions: false },
      }).catch(() => undefined);
    }
    await clearSession();
    return NextResponse.json({ code: "SUCCESS", message: "Signed out", data: null });
  } catch (err) {
    await clearSession().catch(() => undefined);
    return errorJson(err);
  }
}

/**
 * Cookie-clearing exit used by the server-side auth gate. A Server Component
 * (`requireUser`) cannot delete cookies itself, so when it finds the session
 * genuinely dead it redirects here: this Route Handler clears the cookies and
 * sends the browser to `/login`. Without this, `proxy.ts` would keep bouncing
 * `/login → /dashboard` on the still-present (but invalid) refresh cookie.
 */
export async function GET(request: NextRequest) {
  await clearSession().catch(() => undefined);
  return NextResponse.redirect(new URL(ROUTES.login, request.url), { status: 303 });
}
