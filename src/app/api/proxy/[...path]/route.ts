import { NextResponse, type NextRequest } from "next/server";

import { errorJson } from "@/lib/server/auth-routes";
import { ApiError } from "@/lib/errors";
import { rustFetchAuthed } from "@/lib/server/rust-api";

/**
 * Same-origin proxy for the JWT-authenticated panel surface. The browser calls
 * `/api/proxy/projects…`; this handler attaches the `Authorization: Bearer`
 * header from the httpOnly cookie and forwards to the Rust API, refreshing the
 * access token once on a 401.
 *
 * Only the panel (JWT) resources are reachable here. `images` is intentionally
 * excluded — it authenticates with a per-project API key and is served by a
 * dedicated handler.
 */
const ALLOWED_PREFIXES = ["projects", "api-keys", "folders"] as const;

function assertAllowed(segments: string[]): string {
  const path = segments.join("/");
  if (!ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    throw new ApiError({
      status: 404,
      code: "NOT_FOUND",
      message: "Unknown resource.",
    });
  }
  return `/${path}`;
}

async function handle(
  request: NextRequest,
  ctx: RouteContext<"/api/proxy/[...path]">,
  method: "GET" | "POST" | "PATCH" | "DELETE",
): Promise<NextResponse> {
  try {
    const { path } = await ctx.params;
    const rustPath = assertAllowed(path);

    const search = request.nextUrl.search;
    const hasBody = method === "POST" || method === "PATCH";
    const body = hasBody ? await request.text() : undefined;

    const res = await rustFetchAuthed({
      path: rustPath + search,
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body && body.length > 0 ? body : undefined,
    });

    if (res.status === 204) return new NextResponse(null, { status: 204 });
    return NextResponse.json(res.json ?? { code: "SUCCESS", message: "OK", data: null }, {
      status: res.status,
    });
  } catch (err) {
    return errorJson(err);
  }
}

export function GET(request: NextRequest, ctx: RouteContext<"/api/proxy/[...path]">) {
  return handle(request, ctx, "GET");
}
export function POST(request: NextRequest, ctx: RouteContext<"/api/proxy/[...path]">) {
  return handle(request, ctx, "POST");
}
export function PATCH(request: NextRequest, ctx: RouteContext<"/api/proxy/[...path]">) {
  return handle(request, ctx, "PATCH");
}
export function DELETE(request: NextRequest, ctx: RouteContext<"/api/proxy/[...path]">) {
  return handle(request, ctx, "DELETE");
}
