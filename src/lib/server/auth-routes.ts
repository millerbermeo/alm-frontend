import "server-only";

import { NextResponse } from "next/server";

import { ApiError, apiErrorFromResponse, toMessage } from "@/lib/errors";
import { rustFetch } from "@/lib/server/rust-api";
import { writeTokens } from "@/lib/server/session";
import type { ApiEnvelope, AuthResult, UserView } from "@/types/api";

/** Shape returned to the browser after login/register — never the tokens. */
export interface SessionUserResponse {
  user: UserView;
}

/** JSON error body the client HTTP layer understands. */
export function errorJson(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { code: err.code, message: err.message, error_id: err.errorId ?? null, data: null },
      { status: err.status },
    );
  }
  return NextResponse.json(
    { code: "INTERNAL_ERROR", message: toMessage(err), data: null },
    { status: 500 },
  );
}

/**
 * Shared handler for `/api/auth/login` and `/api/auth/register`: forward the
 * credentials to Rust, stash the returned tokens in httpOnly cookies, and
 * echo back only the user.
 */
export async function handleCredentialAuth(
  rustPath: "/auth/login" | "/auth/register",
  payload: unknown,
): Promise<NextResponse> {
  const res = await rustFetch({ path: rustPath, method: "POST", body: payload });

  if (!res.ok) {
    throw apiErrorFromResponse(res.status, res.json);
  }

  const result = (res.json as ApiEnvelope<AuthResult>)?.data;
  if (!result?.access_token || !result.user) {
    throw new ApiError({
      status: 502,
      code: "BAD_UPSTREAM",
      message: "Unexpected response from the authentication service.",
    });
  }

  await writeTokens(result);

  const body: SessionUserResponse = { user: result.user };
  return NextResponse.json(
    { code: "SUCCESS", message: "Authenticated", data: body },
    { status: rustPath === "/auth/register" ? 201 : 200 },
  );
}
