"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { IMAGE_VISIBILITY } from "@/config/constants";
import { formatBytes, formatDateTime } from "@/lib/utils/format";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { SelectField } from "@/components/ui/select-field";
import { CopyButton } from "@/components/ui/copy-button";
import { ImageStatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingState } from "@/components/ui/spinner";
import { imageMetaSchema, type ImageMetaValues } from "@/features/images/schemas";
import { useDeleteImage, useImage, useUpdateImage } from "@/features/images/hooks";
import { buildFolderTree, flattenTree } from "@/features/folders/tree";
import type { Folder, ImageView, ImageVisibility } from "@/types/api";

const VISIBILITY_LABEL: Record<ImageVisibility, string> = {
  PUBLIC: "Pública",
  PRIVATE: "Privada",
};

interface Props {
  projectId: string;
  imageId: string | null;
  folders: Folder[];
  onClose: () => void;
}

export function ImageDetailDrawer({ projectId, imageId, folders, onClose }: Props) {
  const { data: image, isLoading } = useImage(projectId, imageId);
  const update = useUpdateImage(projectId);
  const del = useDeleteImage(projectId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Modal
      isOpen={Boolean(imageId)}
      onOpenChange={(open) => !open && onClose()}
      title={image ? image.original_filename : "Imagen"}
      size="lg"
      isDismissable={!update.isPending && !del.isPending}
    >
      {isLoading || !image ? (
        <LoadingState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Preview image={image} />
          <div className="space-y-5">
            <MetaForm
              key={image.id}
              image={image}
              folders={folders}
              isSaving={update.isPending}
              onSave={(body) => update.mutate({ id: image.id, body })}
            />
            <Variants image={image} />
            <div className="border-t border-border pt-4">
              <Button
                variant="danger-soft"
                onPress={() => setConfirmDelete(true)}
                isDisabled={del.isPending}
              >
                Eliminar imagen
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="¿Eliminar la imagen?"
        description="La imagen y sus variantes se eliminan del almacenamiento. No se puede deshacer."
        confirmLabel="Eliminar imagen"
        isLoading={del.isPending}
        onConfirm={() =>
          image &&
          del.mutate(image.id, {
            onSuccess: () => {
              setConfirmDelete(false);
              onClose();
            },
          })
        }
      />
    </Modal>
  );
}

function Preview({ image }: { image: ImageView }) {
  const url = image.variants.medium ?? image.variants.large ?? image.url ?? image.variants.small;
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-border bg-surface-secondary">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={image.alt_text ?? ""} className="max-h-80 w-full object-contain" />
        ) : (
          <div className="grid h-48 place-items-center text-sm text-muted">Sin vista previa</div>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
        <Info label="Estado" value={<ImageStatusBadge status={image.status} />} />
        <Info label="Formato" value={image.format.toUpperCase()} />
        <Info
          label="Dimensiones"
          value={image.width && image.height ? `${image.width}×${image.height}` : "—"}
        />
        <Info label="Tamaño" value={formatBytes(image.size_bytes)} />
        <Info label="Subida" value={formatDateTime(image.created_at)} />
        <Info label="Actualizada" value={formatDateTime(image.updated_at)} />
      </dl>
      {image.error ? (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger-soft-foreground">
          {image.error}
        </p>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt>{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function MetaForm({
  image,
  folders,
  isSaving,
  onSave,
}: {
  image: ImageView;
  folders: Folder[];
  isSaving: boolean;
  onSave: (body: {
    title?: string;
    alt_text?: string;
    description?: string;
    visibility?: ImageMetaValues["visibility"];
    folder_id?: string | null;
  }) => void;
}) {
  const form = useForm<ImageMetaValues>({
    resolver: zodResolver(imageMetaSchema),
    defaultValues: {
      title: image.title ?? "",
      alt_text: image.alt_text ?? "",
      description: image.description ?? "",
      visibility: image.visibility,
      folder_id: image.folder_id ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      title: image.title ?? "",
      alt_text: image.alt_text ?? "",
      description: image.description ?? "",
      visibility: image.visibility,
      folder_id: image.folder_id ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image.id]);

  const folderOptions = flattenTree(buildFolderTree(folders)).map(({ folder, depth }) => ({
    value: folder.id,
    label: `${"— ".repeat(depth)}${folder.name}`,
  }));

  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit((v) =>
        onSave({
          title: v.title,
          alt_text: v.alt_text,
          description: v.description,
          visibility: v.visibility,
          folder_id: v.folder_id === "" ? null : v.folder_id,
        }),
      )}
      noValidate
    >
      <TextField label="Título" error={form.formState.errors.title?.message} {...form.register("title")} />
      <TextField
        label="Texto alternativo"
        description="Describe la imagen para accesibilidad."
        error={form.formState.errors.alt_text?.message}
        {...form.register("alt_text")}
      />
      <TextareaField
        label="Descripción"
        rows={2}
        error={form.formState.errors.description?.message}
        {...form.register("description")}
      />
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Visibilidad"
          options={IMAGE_VISIBILITY.map((v) => ({ value: v, label: VISIBILITY_LABEL[v] }))}
          {...form.register("visibility")}
        />
        <SelectField
          label="Carpeta"
          placeholder="Sin carpeta"
          options={folderOptions}
          {...form.register("folder_id")}
        />
      </div>
      <Button type="submit" size="sm" isLoading={isSaving} isDisabled={!form.formState.isDirty}>
        Guardar cambios
      </Button>
    </form>
  );
}

function Variants({ image }: { image: ImageView }) {
  const entries = Object.entries(image.variants);
  if (entries.length === 0) {
    return <p className="text-sm text-muted">Las variantes aparecen cuando termina el procesamiento.</p>;
  }
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">URLs</p>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {entries.map(([name, url]) => (
          <li key={name} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
            <span className="font-medium capitalize text-foreground">{name}</span>
            <span className="flex items-center gap-1.5">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="max-w-[16rem] truncate text-accent hover:underline"
              >
                {url}
              </a>
              <CopyButton value={url} label="Copiar" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
