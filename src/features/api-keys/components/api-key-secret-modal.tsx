"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CopyButton } from "@/components/ui/copy-button";
import type { ApiKeySecret } from "@/types/api";

interface Props {
  secret: ApiKeySecret | null;
  onClose: () => void;
}

/** One-time reveal of a freshly created or rotated key's secret. */
export function ApiKeySecretModal({ secret, onClose }: Props) {
  return (
    <Modal
      isOpen={Boolean(secret)}
      onOpenChange={(open) => !open && onClose()}
      title="Copia el secreto de tu clave API"
      size="md"
      footer={
        <Button onPress={onClose}>Lo he guardado en un lugar seguro</Button>
      }
    >
      {secret ? (
        <div className="space-y-4">
          <Alert status="warning" title="Se muestra una sola vez">
            Esta es la única vez que se muestra el secreto completo. Guárdalo ahora — no se puede
            recuperar más tarde.
          </Alert>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">{secret.name}</p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-secondary p-3">
              <code className="flex-1 break-all font-mono text-sm text-foreground">
                {secret.secret}
              </code>
              <CopyButton value={secret.secret} label="Copiar" />
            </div>
          </div>

          <p className="text-xs text-muted">
            Úsalo como <code>Authorization: Bearer {secret.key_prefix}…</code> desde la app que
            consume este proyecto.
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
