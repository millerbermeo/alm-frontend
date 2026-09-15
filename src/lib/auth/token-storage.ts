import type { TokenPair } from "@/types/api";

/**
 * Session storage for a pure static export: there is no server to hold an
 * httpOnly cookie, so tokens and the per-project image API keys live in the
 * browser's `localStorage` instead. This trades XSS-resistance (the old BFF
 * cookie was httpOnly) for being deployable with no Node.js at runtime.
 */
const KEYS = {
  access: "is_at",
  refresh: "is_rt",
  imageKeys: "is_ik",
} as const;

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode, quota) — session just won't persist */
  }
}

function remove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function getAccessToken(): string | null {
  return read(KEYS.access);
}

export function getRefreshToken(): string | null {
  return read(KEYS.refresh);
}

export function setTokens(pair: Pick<TokenPair, "access_token" | "refresh_token">): void {
  write(KEYS.access, pair.access_token);
  write(KEYS.refresh, pair.refresh_token);
}

export function clearTokens(): void {
  remove(KEYS.access);
  remove(KEYS.refresh);
}

// --- per-project image API keys --------------------------------------------

type KeyMap = Record<string, string>;

function readMap(): KeyMap {
  const raw = read(KEYS.imageKeys);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as KeyMap;
  } catch {
    return {};
  }
}

function writeMap(map: KeyMap): void {
  if (Object.keys(map).length === 0) {
    remove(KEYS.imageKeys);
    return;
  }
  write(KEYS.imageKeys, JSON.stringify(map));
}

export function getImageKey(projectId: string): string | null {
  return readMap()[projectId] ?? null;
}

export function setImageKey(projectId: string, secret: string): void {
  const map = readMap();
  map[projectId] = secret;
  writeMap(map);
}

export function clearImageKey(projectId: string): void {
  const map = readMap();
  delete map[projectId];
  writeMap(map);
}

export function clearAllImageKeys(): void {
  remove(KEYS.imageKeys);
}
