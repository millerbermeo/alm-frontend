import "server-only";

import { env } from "@/config/env";
import type { Health, Readiness } from "@/types/api";

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(new URL(path, env.RUST_API_URL), { cache: "no-store" });
    if (!res.ok && res.status !== 503) return null;
    const body = await res.json().catch(() => null);
    return (body?.status ? body : null) as T | null;
  } catch {
    return null;
  }
}

export interface BackendStatus {
  reachable: boolean;
  health: Health | null;
  readiness: Readiness | null;
}

/** Liveness + readiness of the Rust backend, for the dashboard. */
export async function getBackendStatus(): Promise<BackendStatus> {
  const [health, readiness] = await Promise.all([
    getJson<Health>("/health"),
    getJson<Readiness>("/ready"),
  ]);
  return { reachable: Boolean(health), health, readiness };
}
