import { NextResponse, type NextRequest } from "next/server";

import { errorJson } from "@/lib/server/auth-routes";
import { ApiError } from "@/lib/errors";
import { rustFetch, rustFetchAuthed, unwrap } from "@/lib/server/rust-api";
import { clearImageKey, getImageKey, setImageKey } from "@/lib/server/image-keys";
import type { ApiKeyView } from "@/types/api";

const KEY_RE = /^img_(live|test)_[0-9a-f]{40}$/;

/** GET — is an image key configured for this project? */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/image-keys/[projectId]">) {
  try {
    const { projectId } = await ctx.params;
    const key = await getImageKey(projectId);
    return NextResponse.json({
      code: "SUCCESS",
      message: "OK",
      data: { configured: Boolean(key) },
    });
  } catch (err) {
    return errorJson(err);
  }
}

/**
 * POST { secret } — validate the pasted key belongs to this project, works,
 * and has `images:read`; then store it encrypted in the `is_ik` cookie.
 */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/image-keys/[projectId]">) {
  try {
    const { projectId } = await ctx.params;
    const body = (await request.json().catch(() => ({}))) as { secret?: unknown };
    const secret = typeof body.secret === "string" ? body.secret.trim() : "";

    if (!KEY_RE.test(secret)) {
      throw new ApiError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: "That doesn't look like a valid API key (img_live_… / img_test_…).",
      });
    }

    // 1. Confirm the key belongs to THIS project (prefix match against the list).
    const prefix = secret.slice(0, "img_live_".length + 12);
    const keys = unwrap<ApiKeyView[]>(
      await rustFetchAuthed({ path: `/projects/${projectId}/api-keys` }),
    );
    const match = keys.find((k) => k.key_prefix === prefix);
    if (!match) {
      throw new ApiError({
        status: 400,
        code: "KEY_NOT_IN_PROJECT",
        message: "This key does not belong to this project.",
      });
    }
    if (!match.is_active) {
      throw new ApiError({
        status: 400,
        code: "KEY_INACTIVE",
        message: "This key is revoked or expired.",
      });
    }
    if (!match.permissions.includes("images:read")) {
      throw new ApiError({
        status: 400,
        code: "KEY_MISSING_READ",
        message: "This key needs the images:read permission to be used by the panel.",
      });
    }

    // 2. Live check.
    const probe = await rustFetch({
      path: "/images",
      searchParams: { limit: 1 },
      headers: { authorization: `Bearer ${secret}` },
    });
    if (!probe.ok) {
      throw new ApiError({
        status: 400,
        code: "KEY_REJECTED",
        message: "The backend rejected this key.",
      });
    }

    await setImageKey(projectId, secret);
    return NextResponse.json({
      code: "SUCCESS",
      message: "Image key configured",
      data: { configured: true, permissions: match.permissions, name: match.name },
    });
  } catch (err) {
    return errorJson(err);
  }
}

/** DELETE — forget the stored key for this project. */
export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/image-keys/[projectId]">) {
  try {
    const { projectId } = await ctx.params;
    await clearImageKey(projectId);
    return NextResponse.json({ code: "SUCCESS", message: "Removed", data: { configured: false } });
  } catch (err) {
    return errorJson(err);
  }
}
