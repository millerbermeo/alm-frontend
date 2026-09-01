import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { ROUTES } from "@/config/constants";
import { getCurrentUser } from "@/lib/server/auth";
import { getBackendStatus } from "@/lib/server/health";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { RoleBadge } from "@/components/ui/role-badge";
import { ArrowRightIcon, BoxIcon, GearIcon, KeyIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Panel" };

export default async function DashboardPage() {
  const [user, status] = await Promise.all([getCurrentUser(), getBackendStatus()]);

  const upDown = (v: string) => (v === "up" ? "activo" : v === "down" ? "caído" : v);
  const services: { label: string; value: string; ok: boolean }[] = [
    { label: "API", value: status.reachable ? "Accesible" : "Inaccesible", ok: status.reachable },
    ...(status.readiness
      ? [
          { label: "Base de datos", value: upDown(status.readiness.database), ok: status.readiness.database === "up" },
          { label: "Redis", value: upDown(status.readiness.redis), ok: status.readiness.redis === "up" },
          { label: "Almacenamiento", value: upDown(status.readiness.storage), ok: status.readiness.storage === "up" },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title={`Hola, ${user?.name ?? "de nuevo"}`}
        description="Proyectos, claves API por proyecto, carpetas e imágenes optimizadas — todo en un mismo lugar."
      />

      {/* Service health tiles */}
      <section aria-label="Estado de los servicios" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {services.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={<span className="capitalize">{s.value}</span>}
            dotTone={s.ok ? "success" : "danger"}
            delta={{ text: s.ok ? "Operativo" : "Con incidencias", tone: s.ok ? "success" : "danger" }}
          />
        ))}
      </section>

      {/* Quick links */}
      <section aria-label="Accesos rápidos" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <QuickLink
          href={ROUTES.projects}
          title="Proyectos"
          body="Crea y gestiona las aplicaciones que consumen el servicio."
          icon={<BoxIcon />}
        />
        <QuickLink
          href={ROUTES.projects}
          title="Claves API"
          body="Emite credenciales por proyecto para subir y leer imágenes."
          icon={<KeyIcon />}
        />
        <QuickLink
          href={ROUTES.settings}
          title="Ajustes"
          body="Tu perfil, tu sesión y las preferencias del panel."
          icon={<GearIcon />}
        />
      </section>

      {/* Detail row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Servidor</CardTitle>
            {status.health ? (
              <span className="text-xs text-muted">
                v{status.health.version} · activo {Math.floor(status.health.uptime_seconds / 60)} min
              </span>
            ) : null}
          </CardHeader>
          <CardBody className="divide-y divide-border text-sm">
            {services.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-muted">{s.label}</span>
                <span className="inline-flex items-center gap-2 font-medium capitalize">
                  <span className={`size-2 rounded-full ${s.ok ? "bg-success" : "bg-danger"}`} />
                  {s.value}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tu cuenta</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <Field label="Nombre" value={user?.name ?? "—"} />
            <Field label="Correo" value={user?.email ?? "—"} />
            <Field label="Rol" value={user ? <RoleBadge role={user.role} /> : "—"} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="truncate text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function QuickLink({
  href,
  title,
  body,
  icon,
}: {
  href: string;
  title: string;
  body: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/60 hover:bg-surface-secondary/60"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-soft-foreground">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
          {title}
          <ArrowRightIcon className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
        </span>
        <span className="mt-1 block text-sm text-muted">{body}</span>
      </span>
    </Link>
  );
}

