"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toMessage } from "@/lib/errors";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useCreateApiKey } from "@/features/api-keys/hooks";
import { useConfigureImageKey, useImageKeyStatus, useRemoveImageKey } from "@/features/images/hooks";
import {
  newKeyNameSchema,
  pasteKeySchema,
  type NewKeyNameValues,
  type PasteKeyValues,
} from "@/features/images/schemas";
import type { ImagePermission } from "@/types/api";

const PANEL_PERMS: ImagePermission[] = [
  "images:read",
  "images:upload",
  "images:update",
  "images:delete",
];

/**
 * The `/images` endpoints authenticate with a project API key, not the panel
 * JWT. This gates the Images module: the admin either creates a key here or
 * pastes one, and the BFF keeps it encrypted server-side.
 */
export function ImageKeySetup({ projectId }: { projectId: string }) {
  const status = useImageKeyStatus(projectId);
  const configure = useConfigureImageKey(projectId);
  const removeKey = useRemoveImageKey(projectId);
  const createKey = useCreateApiKey(projectId);
  const [mode, setMode] = useState<"create" | "paste">("create");

  const newKeyForm = useForm<NewKeyNameValues>({
    resolver: zodResolver(newKeyNameSchema),
    defaultValues: { name: "Acceso del panel" },
  });
  const pasteForm = useForm<PasteKeyValues>({
    resolver: zodResolver(pasteKeySchema),
    defaultValues: { secret: "" },
  });

  const busy = configure.isPending || createKey.isPending || removeKey.isPending;
  const error =
    configure.error || createKey.error
      ? toMessage(configure.error ?? createKey.error)
      : null;

  if (status.isLoading) return null;

  if (status.data?.configured) {
    return (
      <Card className="max-w-xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Clave API de imágenes</CardTitle>
          <Badge tone="success" dot>
            Configurada
          </Badge>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <p className="text-muted">
            El panel usa{" "}
            <span className="font-medium text-foreground">
              {status.data.name ?? "una clave guardada"}
            </span>{" "}
            para gestionar las imágenes de este proyecto. El secreto está cifrado y nunca se envía a tu
            navegador.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              isLoading={removeKey.isPending}
              onPress={() => removeKey.mutate()}
            >
              Quitar
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  function createAndConfigure(values: NewKeyNameValues) {
    createKey.mutate(
      { name: values.name, permissions: PANEL_PERMS, test: false },
      { onSuccess: (secret) => configure.mutate(secret.secret) },
    );
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Conecta una clave API de imágenes</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm text-muted">
          Las imágenes usan una clave API del proyecto. Crea una para el panel o pega una clave existente
          que tenga al menos <code>images:read</code>.
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "create" ? "primary" : "outline"}
            onPress={() => setMode("create")}
          >
            Crear una clave
          </Button>
          <Button
            size="sm"
            variant={mode === "paste" ? "primary" : "outline"}
            onPress={() => setMode("paste")}
          >
            Pegar una clave
          </Button>
        </div>

        {error ? <Alert status="danger">{error}</Alert> : null}

        {mode === "create" ? (
          <form
            className="space-y-3"
            onSubmit={newKeyForm.handleSubmit(createAndConfigure)}
            noValidate
          >
            <TextField
              label="Nombre de la clave"
              isRequired
              description="Se crea con images:read, upload, update y delete."
              error={newKeyForm.formState.errors.name?.message}
              {...newKeyForm.register("name")}
            />
            <Button type="submit" isLoading={busy}>
              Crear y conectar
            </Button>
          </form>
        ) : (
          <form
            className="space-y-3"
            onSubmit={pasteForm.handleSubmit((v) => configure.mutate(v.secret))}
            noValidate
          >
            <TextField
              label="Secreto de la clave API"
              isRequired
              placeholder="img_live_…"
              autoComplete="off"
              error={pasteForm.formState.errors.secret?.message}
              {...pasteForm.register("secret")}
            />
            <Button type="submit" isLoading={busy}>
              Conectar
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
