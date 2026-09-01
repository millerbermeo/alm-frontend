import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { getCurrentUser } from "@/lib/server/auth";
import { Logo } from "@/components/ui/logo";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  if (await getCurrentUser()) redirect(ROUTES.dashboard);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr] xl:grid-cols-2">
      {/* Brand panel — hidden on small screens */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-soft via-surface to-background" />
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-96 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Logo />
          <div className="max-w-md space-y-5">
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-foreground">
              Gestión de imágenes, pensada para muchas apps.
            </h2>
            <p className="text-base leading-7 text-muted">
              Proyectos, claves API por proyecto, carpetas y variantes de imagen
              optimizadas — con aislamiento estricto entre inquilinos.
            </p>
          </div>
          <p className="text-xs text-muted">Panel de administración · sesión JWT</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="w-full max-w-[26rem]">{children}</div>
      </div>
    </div>
  );
}
