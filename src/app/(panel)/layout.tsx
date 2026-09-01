import type { ReactNode } from "react";

import { requireUser } from "@/lib/server/auth";
import { PanelShell } from "@/components/layout/panel-shell";

/**
 * Server-side auth gate for the whole panel. `proxy.ts` already redirected
 * cookie-less requests; this re-checks against the backend (`/auth/me`) so a
 * stale/tampered cookie can't render the panel.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return <PanelShell user={user}>{children}</PanelShell>;
}
