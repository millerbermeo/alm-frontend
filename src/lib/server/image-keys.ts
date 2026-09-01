import "server-only";

import { cookies } from "next/headers";

import { COOKIE, REFRESH_COOKIE_MAX_AGE } from "@/config/constants";
import { env } from "@/config/env";
import { decryptJson, encryptJson } from "@/lib/server/crypto";

/**
 * Per-project image API keys, kept encrypted in the `is_ik` httpOnly cookie so
 * the panel can call the API-key-authenticated `/images` endpoints on the
 * user's behalf without ever exposing the secret to the browser.
 *
 * Shape: `{ [projectId]: "img_live_…" }`
 */
type KeyMap = Record<string, string>;

const baseCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.COOKIE_SECURE,
  path: "/",
  maxAge: REFRESH_COOKIE_MAX_AGE,
} as const;

async function readMap(): Promise<KeyMap> {
  const jar = await cookies();
  const token = jar.get(COOKIE.imageKeys)?.value;
  if (!token) return {};
  return decryptJson<KeyMap>(token) ?? {};
}

async function writeMap(map: KeyMap): Promise<void> {
  const jar = await cookies();
  if (Object.keys(map).length === 0) {
    jar.delete(COOKIE.imageKeys);
    return;
  }
  jar.set(COOKIE.imageKeys, encryptJson(map), baseCookie);
}

export async function getImageKey(projectId: string): Promise<string | null> {
  const map = await readMap();
  return map[projectId] ?? null;
}

export async function setImageKey(projectId: string, secret: string): Promise<void> {
  const map = await readMap();
  map[projectId] = secret;
  await writeMap(map);
}

export async function clearImageKey(projectId: string): Promise<void> {
  const map = await readMap();
  delete map[projectId];
  await writeMap(map);
}
