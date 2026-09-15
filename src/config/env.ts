import { z } from "zod";

/**
 * Client-safe environment — only `NEXT_PUBLIC_*` vars are available (inlined
 * at build time; there is no server at runtime to read `process.env` from).
 * Parsed once at module load; a bad `.env.local` fails fast with a readable
 * message instead of surfacing as a confusing runtime error.
 */
const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().transform((v) => v.replace(/\/+$/, "")),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
