import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/server/auth";
import { formatDateTime } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge } from "@/components/ui/role-badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <>
      <PageHeader title="Ajustes" description="Tu perfil y las preferencias del panel." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardBody className="divide-y divide-border text-sm">
            <Row label="Nombre" value={user.name} />
            <Row label="Correo" value={user.email} />
            <Row label="Rol" value={<RoleBadge role={user.role} />} />
            <Row label="Estado" value={user.is_active ? "Activo" : "Deshabilitado"} />
            <Row label="Miembro desde" value={formatDateTime(user.created_at)} />
            <Row label="Último acceso" value={formatDateTime(user.last_login_at)} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Tema</p>
                <p className="text-muted">Claro, oscuro o seguir el sistema.</p>
              </div>
              <ThemeToggle />
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
