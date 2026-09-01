import { NextResponse, type NextRequest } from "next/server";

import { errorJson } from "@/lib/server/auth-routes";
import { ApiError } from "@/lib/errors";
import { rustFetch } from "@/lib/server/rust-api";
import { getImageKey } from "@/lib/server/image-keys";

/**
 * Image proxy. The panel calls `/api/images/{projectId}[/imageId]`; this
 * handler attaches the per-project image API key (decrypted from the `is_ik`
 * cookie) as `Authorization: Bearer img_live_…` and forwards to the Rust
 * `/api/v1/images` surface. A missing key returns `409 IMAGE_KEY_MISSING` so
 * the UI can prompt for setup.
 */
type Ctx = RouteContext<"/api/images/[projectId]/[[...path]]">;

async function keyOr409(projectId: string): Promise<string> {
  const key = await getImageKey(projectId);
  if (!key) {
    throw new ApiError({
      status: 409,
      code: "IMAGE_KEY_MISSING",
      message: "No image API key is configured for this project.",
    });
  }
  return key;
}

function rustImagePath(path: string[] | undefined): string {
  const rest = (path ?? []).join("/");
  return rest ? `/images/${rest}` : "/images";
}

function relay(status: number, json: unknown): NextResponse {
  if (status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(json ?? { code: "SUCCESS", message: "OK", data: null }, { status });
}

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const { projectId, path } = await ctx.params;
    const key = await keyOr409(projectId);
    const res = await rustFetch({
      path: rustImagePath(path) + request.nextUrl.search,
      headers: { authorization: `Bearer ${key}` },
    });
    return relay(res.status, res.json);
  } catch (err) {
    return errorJson(err);
  }
}

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { projectId, path } = await ctx.params;
    const key = await keyOr409(projectId);
    // Upload — pass the multipart body straight through.
    const form = await request.formData();
    const res = await rustFetch({
      path: rustImagePath(path),
      method: "POST",
      headers: { authorization: `Bearer ${key}` },
      body: form,
    });
    return relay(res.status, res.json);
  } catch (err) {
    return errorJson(err);
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { projectId, path } = await ctx.params;
    const key = await keyOr409(projectId);
    const body = await request.text();
    const res = await rustFetch({
      path: rustImagePath(path),
      method: "PATCH",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: body && body.length > 0 ? body : undefined,
    });
    return relay(res.status, res.json);
  } catch (err) {
    return errorJson(err);
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    const { projectId, path } = await ctx.params;
    const key = await keyOr409(projectId);
    const res = await rustFetch({
      path: rustImagePath(path),
      method: "DELETE",
      headers: { authorization: `Bearer ${key}` },
    });
    return relay(res.status, res.json);
  } catch (err) {
    return errorJson(err);
  }
}
