import type { NextRequest } from "next/server";

import { registerSchema } from "@/features/auth/schemas";
import { errorJson, handleCredentialAuth } from "@/lib/server/auth-routes";
import { ApiError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError({
        status: 400,
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid registration payload.",
      });
    }
    const { name, email, password } = parsed.data;
    return await handleCredentialAuth("/auth/register", { name, email, password });
  } catch (err) {
    return errorJson(err);
  }
}
