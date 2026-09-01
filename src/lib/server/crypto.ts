import "server-only";

import { env } from "@/config/env";
import { decryptJsonWith, encryptJsonWith } from "@/lib/server/crypto-core";

/** AES-256-GCM using `SESSION_SECRET`. See `crypto-core` for the implementation. */
export const encryptJson = (value: unknown): string =>
  encryptJsonWith(env.SESSION_SECRET, value);

export const decryptJson = <T>(token: string): T | null =>
  decryptJsonWith<T>(env.SESSION_SECRET, token);
