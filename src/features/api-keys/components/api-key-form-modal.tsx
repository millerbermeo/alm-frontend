"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ApiError } from "@/lib/errors";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Alert } from "@/components/ui/alert";
import { createApiKeySchema, type CreateApiKeyValues } from "@/features/api-keys/schemas";
import { useCreateApiKey } from "@/features/api-keys/hooks";
import { PermissionChecklist } from "@/features/api-keys/components/permission-checklist";
import type { ApiKeySecret } from "@/types/api";

interface Props {
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (secret: ApiKeySecret) => void;
}

export function ApiKeyFormModal({ projectId, isOpen, onOpenChange, onCreated }: Props) {
  const create = useCreateApiKey(projectId);

  const form = useForm<CreateApiKeyValues>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: { name: "", permissions: ["images:read", "images:upload"], test: false, expires_at: "" },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: "", permissions: ["images:read", "images:upload"], test: false, expires_at: "" });
      create.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const formError =
    create.error instanceof ApiError && !create.error.isServer
      ? create.error.message
      : create.error
        ? "No se pudo crear la clave. Inténtalo de nuevo."
        : null;

  function submit(values: CreateApiKeyValues) {
    create.mutate(
      {
        name: values.name,
        permissions: values.permissions,
        test: values.test,
        expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : undefined,
      },
      {
        onSuccess: (secret) => {
          onOpenChange(false);
          onCreated(secret);
        },
      },
    );
  }

  const { errors } = form.formState;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nueva clave API"
      description="Las apps externas presentan esta clave para subir y leer las imágenes de este proyecto."
      size="lg"
      isDismissable={!create.isPending}
      footer={
        <>
          <Button variant="ghost" onPress={() => onOpenChange(false)} isDisabled={create.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="api-key-form" isLoading={create.isPending}>
            Crear clave
          </Button>
        </>
      }
    >
      <form id="api-key-form" className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
        {formError ? <Alert status="danger">{formError}</Alert> : null}

        <TextField
          label="Nombre"
          isRequired
          autoFocus
          placeholder="Ecommerce Production"
          error={errors.name?.message}
          {...form.register("name")}
        />

        <Controller
          control={form.control}
          name="permissions"
          render={({ field }) => (
            <PermissionChecklist
              value={field.value}
              onChange={field.onChange}
              error={errors.permissions?.message}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Caduca el"
            type="datetime-local"
            description="Opcional. Déjalo vacío para que no caduque."
            error={errors.expires_at?.message}
            {...form.register("expires_at")}
          />
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" className="size-4 accent-[var(--color-accent)]" {...form.register("test")} />
            <span>
              <span className="block font-medium text-foreground">Clave de prueba</span>
              <span className="block text-xs text-muted">Emite una clave con prefijo <code>img_test_</code></span>
            </span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
