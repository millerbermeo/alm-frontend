"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ApiError } from "@/lib/errors";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Alert } from "@/components/ui/alert";
import { folderFormSchema, type FolderFormValues } from "@/features/folders/schemas";
import { useCreateFolder, useRenameFolder } from "@/features/folders/hooks";
import type { Folder } from "@/types/api";

interface Props {
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rename target. */
  folder?: Folder;
  /** Parent for a new folder (omit for a root folder). */
  parent?: Folder;
}

export function FolderFormModal({ projectId, isOpen, onOpenChange, folder, parent }: Props) {
  const isRename = Boolean(folder);
  const create = useCreateFolder(projectId);
  const rename = useRenameFolder(projectId);
  const mutation = isRename ? rename : create;

  const form = useForm<FolderFormValues>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: { name: folder?.name ?? "" },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: folder?.name ?? "" });
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, folder?.id]);

  const formError =
    mutation.error instanceof ApiError && !mutation.error.isServer
      ? mutation.error.message
      : mutation.error
        ? "No se pudo guardar la carpeta."
        : null;

  function submit(v: FolderFormValues) {
    const onSuccess = () => onOpenChange(false);
    if (isRename && folder) {
      rename.mutate({ id: folder.id, body: { name: v.name } }, { onSuccess });
    } else {
      create.mutate(
        { project_id: projectId, name: v.name, parent_id: parent?.id },
        { onSuccess },
      );
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={
        isRename
          ? "Renombrar carpeta"
          : parent
            ? `Nueva carpeta en ${parent.name}`
            : "Nueva carpeta"
      }
      description={
        isRename ? "Renombrar actualiza la ruta de esta carpeta y la de sus descendientes." : undefined
      }
      size="sm"
      isDismissable={!mutation.isPending}
      footer={
        <>
          <Button variant="ghost" onPress={() => onOpenChange(false)} isDisabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="folder-form" isLoading={mutation.isPending}>
            {isRename ? "Renombrar" : "Crear"}
          </Button>
        </>
      }
    >
      <form id="folder-form" className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
        {formError ? <Alert status="danger">{formError}</Alert> : null}
        <TextField
          label="Nombre"
          isRequired
          autoFocus
          placeholder="products"
          description="Se pasa a minúsculas y se convierte en slug para la ruta."
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
      </form>
    </Modal>
  );
}
