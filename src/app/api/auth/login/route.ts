import type { NextRequest } from "next/server";

import { loginSchema } from "@/features/auth/schemas";
import { errorJson, handleCredentialAuth } from "@/lib/server/auth-routes";
import { ApiError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid credentials payload.",
      });
    }
    return await handleCredentialAuth("/auth/login", parsed.data);
  } catch (err) {
    return errorJson(err);
  }
}
