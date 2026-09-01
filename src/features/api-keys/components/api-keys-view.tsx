"use client";

import { useState } from "react";

import { formatDate, formatRelative } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SectionIntro } from "@/components/ui/section-intro";
import {
  useApiKeys,
  useDeleteApiKey,
  useRevokeApiKey,
  useRotateApiKey,
} from "@/features/api-keys/hooks";
import { ApiKeyFormModal } from "@/features/api-keys/components/api-key-form-modal";
import { ApiKeySecretModal } from "@/features/api-keys/components/api-key-secret-modal";
import type { ApiKeySecret, ApiKeyView } from "@/types/api";

function keyState(k: ApiKeyView): { tone: "success" | "danger" | "neutral"; label: string } {
  if (k.revoked_at) return { tone: "danger", label: "Revocada" };
  if (k.expires_at && new Date(k.expires_at).getTime() <= Date.now())
    return { tone: "neutral", label: "Caducada" };
  return { tone: "success", label: "Activa" };
}

export function ApiKeysView({ projectId }: { projectId: string }) {
  const query = useApiKeys(projectId);
  const revoke = useRevokeApiKey(projectId);
  const rotate = useRotateApiKey(projectId);
  const del = useDeleteApiKey(projectId);

  const [formOpen, setFormOpen] = useState(false);
  const [secret, setSecret] = useState<ApiKeySecret | null>(null);
  const [confirm, setConfirm] = useState<
    { kind: "revoke" | "rotate" | "delete"; key: ApiKeyView } | null
  >(null);

  const busy = revoke.isPending || rotate.isPending || del.isPending;

  const columns: Column<ApiKeyView>[] = [
    {
      key: "name",
      header: "Nombre",
      cell: (k) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{k.name}</span>
          <code className="text-xs text-muted">{k.key_prefix}…</code>
        </div>
      ),
    },
    {
      key: "permissions",
      header: "Permisos",
      cell: (k) => (
        <div className="flex flex-wrap gap-1">
          {k.permissions.map((p) => (
            <Badge key={p} tone="neutral">
              {p.replace("images:", "")}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "state",
      header: "Estado",
      cell: (k) => {
        const s = keyState(k);
        return (
          <Badge tone={s.tone} dot>
            {s.label}
          </Badge>
        );
      },
    },
    {
      key: "used",
      header: "Último uso",
      cell: (k) => (k.last_used_at ? formatRelative(k.last_used_at) : "Nunca"),
    },
    {
      key: "expires",
      header: "Caducidad",
      cell: (k) => (k.expires_at ? formatDate(k.expires_at) : "—"),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (k) => (
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            isDisabled={busy}
            onPress={() => setConfirm({ kind: "rotate", key: k })}
          >
            Rotar
          </Button>
          {!k.revoked_at ? (
            <Button
              size="sm"
              variant="ghost"
              isDisabled={busy}
              onPress={() => setConfirm({ kind: "revoke", key: k })}
            >
              Revocar
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="danger-soft"
            isDisabled={busy}
            onPress={() => setConfirm({ kind: "delete", key: k })}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const confirmText = {
    revoke: {
      title: "¿Revocar esta clave?",
      body: "Las peticiones que la usen empezarán a fallar de inmediato. No se puede deshacer.",
      label: "Revocar",
      tone: "danger" as const,
    },
    rotate: {
      title: "¿Rotar esta clave?",
      body: "Se emite un secreto nuevo y se muestra una vez; la clave actual se revoca.",
      label: "Rotar",
      tone: "primary" as const,
    },
    delete: {
      title: "¿Eliminar esta clave?",
      body: "La clave se elimina permanentemente. No se puede deshacer.",
      label: "Eliminar",
      tone: "danger" as const,
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Claves API</h2>
          <p className="text-sm text-muted">Credenciales que usan las apps para llamar a la API de imágenes.</p>
        </div>
        <Button onPress={() => setFormOpen(true)}>Nueva clave API</Button>
      </div>

      <SectionIntro
        id="api-keys"
        title="Para qué sirven las claves API"
        points={[
          "Tu aplicación envía la clave en una cabecera (Authorization: Bearer …) en cada petición a la API de imágenes.",
          "Los permisos limitan lo que puede hacer una clave: leer, subir, actualizar, eliminar, transformar.",
          "El secreto se muestra una sola vez, al crearla. Guárdalo en el entorno de tu aplicación, nunca en el código del cliente.",
          "Rotar cambia el secreto sin cortes; Revocar anula al instante una clave filtrada.",
        ]}
      >
        Las claves API son las credenciales que usan las aplicaciones externas para llamar a la API
        de imágenes de este proyecto. Cada clave pertenece solo a este proyecto.
      </SectionIntro>

      <DataTable
        columns={columns}
        rows={query.data}
        rowKey={(k) => k.id}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error}
        onRetry={() => query.refetch()}
        empty={{
          title: "Aún no hay claves API",
          description: "Crea una clave para que una app pueda subir y leer las imágenes de este proyecto.",
          action: <Button onPress={() => setFormOpen(true)}>Nueva clave API</Button>,
        }}
      />

      <ApiKeyFormModal
        projectId={projectId}
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onCreated={setSecret}
      />

      <ApiKeySecretModal secret={secret} onClose={() => setSecret(null)} />

      <ConfirmDialog
        isOpen={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm ? confirmText[confirm.kind].title : ""}
        description={confirm ? confirmText[confirm.kind].body : undefined}
        confirmLabel={confirm ? confirmText[confirm.kind].label : "Confirmar"}
        tone={confirm ? confirmText[confirm.kind].tone : "danger"}
        isLoading={busy}
        onConfirm={() => {
          if (!confirm) return;
          const id = confirm.key.id;
          if (confirm.kind === "revoke")
            revoke.mutate(id, { onSettled: () => setConfirm(null) });
          if (confirm.kind === "delete")
            del.mutate(id, { onSettled: () => setConfirm(null) });
          if (confirm.kind === "rotate")
            rotate.mutate(id, {
              onSuccess: (s) => setSecret(s),
              onSettled: () => setConfirm(null),
            });
        }}
      />
    </div>
  );
}
