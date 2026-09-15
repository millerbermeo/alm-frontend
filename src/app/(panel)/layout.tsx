"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { useSession } from "@/features/auth/hooks";
import { PanelShell } from "@/components/layout/panel-shell";
import { LoadingState } from "@/components/ui/spinner";

/**
 * Client-side auth gate for the whole panel — static export, no server to
 * check the session against before rendering. `useSession` resolves `null`
 * fast (no network call) when there is no token stored at all.
 */
export default function PanelLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !user) router.replace(ROUTES.login);
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <LoadingState label="Cargando…" />
      </div>
    );
  }

  return <PanelShell user={user}>{children}</PanelShell>;
}
