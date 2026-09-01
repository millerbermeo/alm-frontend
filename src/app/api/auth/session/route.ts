import { NextResponse } from "next/server";

import { errorJson } from "@/lib/server/auth-routes";
import { ApiError } from "@/lib/errors";
import { rustFetchAuthed, unwrap } from "@/lib/server/rust-api";
import type { UserView } from "@/types/api";

/**
 * Returns the current user (`/auth/me`). Runs inside a Route Handler, so a
 * silent token refresh here also re-persists the refreshed cookies.
 * `200 { data: { user } }` when authenticated, `401` otherwise.
 */
export async function GET() {
  try {
    const res = await rustFetchAuthed({ path: "/auth/me" });
    if (res.status === 401) {
      throw new ApiError({ status: 401, code: "UNAUTHORIZED", message: "Not authenticated." });
    }
    const user = unwrap<UserView>(res);
    return NextResponse.json({ code: "SUCCESS", message: "OK", data: { user } });
  } catch (err) {
    return errorJson(err);
  }
}
