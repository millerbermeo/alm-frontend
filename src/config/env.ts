import "server-only";

import { z } from "zod";

/**
 * Server-only environment. Parsed once at module load; a bad `.env.local`
 * fails fast with a readable message instead of surfacing as a runtime 500.
 */
const schema = z.object({
  RUST_API_URL: z.string().url().transform((v) => v.replace(/\/+$/, "")),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  IMAGE_CDN_HOSTNAME: z.string().optional().default(""),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
