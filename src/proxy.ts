import { NextResponse, type NextRequest } from "next/server";

import { COOKIE } from "@/config/constants";

/**
 * Edge of the panel. This is a coarse routing guard only — it checks for the
 * presence of the session cookie and redirects. Real authentication and
 * authorization happen in the Server Components / Route Handlers via
 * `getCurrentUser()` (see `lib/server/auth.ts`); never trust this alone.
 *
 * Next.js 16 renamed `middleware` → `proxy` (nodejs runtime, not edge).
 */
const PUBLIC_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(COOKIE.refresh)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (hasSession && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Run on everything except Next internals, the BFF API routes (they do their
   * own auth), and static assets.
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
