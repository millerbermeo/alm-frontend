import { env } from "@/config/env";
import type { Health, Readiness } from "@/types/api";

async function getJson<T extends { status: string }>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, { cache: "no-store" });
    if (!res.ok && res.status !== 503) return null;
    const body = (await res.json().catch(() => null)) as (T & { status?: string }) | null;
    return body?.status ? (body as T) : null;
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
