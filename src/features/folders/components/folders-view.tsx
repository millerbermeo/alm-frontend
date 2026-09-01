"use client";

import { useMemo, useState } from "react";

import { toMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SectionIntro } from "@/components/ui/section-intro";
import { useDeleteFolder, useFolders } from "@/features/folders/hooks";
import { buildFolderTree, flattenTree } from "@/features/folders/tree";
import { FolderFormModal } from "@/features/folders/components/folder-form-modal";
import type { Folder } from "@/types/api";

export function FoldersView({ projectId }: { projectId: string }) {
  const query = useFolders(projectId);
  const del = useDeleteFolder(projectId);

  const [createUnder, setCreateUnder] = useState<Folder | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [renaming, setRenaming] = useState<Folder | undefined>();
  const [deleting, setDeleting] = useState<Folder | undefined>();

  const flat = useMemo(
    () => flattenTree(buildFolderTree(query.data ?? [])),
    [query.data],
  );

  function openCreate(parent?: Folder) {
    setCreateUnder(parent);
    setRenaming(undefined);
    setCreateOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Carpetas</h2>
          <p className="text-sm text-muted">Organiza las imágenes de este proyecto en un árbol de rutas.</p>
        </div>
        <Button onPress={() => openCreate(undefined)}>Nueva carpeta</Button>
      </div>

      <SectionIntro
        id="folders"
        title="Las carpetas son organización opcional"
        points={[
          "Funcionan como directorios: una imagen puede colocarse en una carpeta para formar una ruta (p. ej. banners/inicio/hero.jpg).",
          "Por sí solas no cambian el acceso ni las URLs — sirven para mantener ordenadas las bibliotecas grandes.",
          "Filtra la pestaña Imágenes por carpeta para encontrar cosas rápido.",
        ]}
      >
        Las carpetas dan a las imágenes de este proyecto un árbol de rutas. Puedes omitirlas por
        completo si tienes pocas imágenes.
      </SectionIntro>

      {query.isLoading ? (
        <LoadingState label="Cargando carpetas…" />
      ) : query.error ? (
        <Alert status="danger" title="No se pudieron cargar las carpetas">
          {toMessage(query.error)}
        </Alert>
      ) : flat.length === 0 ? (
        <EmptyState
          title="Aún no hay carpetas"
          description="Las carpetas son opcionales — solo te ayudan a organizar las imágenes."
          action={<Button onPress={() => openCreate(undefined)}>Nueva carpeta</Button>}
        />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-surface">
          {flat.map(({ folder, depth }) => (
            <li
              key={folder.id}
              className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-surface-secondary"
            >
              <div className="flex min-w-0 items-center gap-2" style={{ paddingLeft: depth * 20 }}>
                <FolderIcon />
                <span className="truncate font-medium text-foreground">{folder.name}</span>
                <code className="truncate text-xs text-muted">{folder.path}</code>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="sm" variant="ghost" onPress={() => openCreate(folder)}>
                  Añadir subcarpeta
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    setRenaming(folder);
                    setCreateOpen(true);
                  }}
                >
                  Renombrar
                </Button>
                <Button size="sm" variant="danger-soft" onPress={() => setDeleting(folder)}>
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FolderFormModal
        projectId={projectId}
        isOpen={createOpen}
        onOpenChange={setCreateOpen}
        folder={renaming}
        parent={renaming ? undefined : createUnder}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title="¿Eliminar la carpeta?"
        description={
          deleting
            ? `«${deleting.name}» debe estar vacía (sin subcarpetas ni imágenes) para poder eliminarla.`
            : undefined
        }
        confirmLabel="Eliminar carpeta"
        isLoading={del.isPending}
        onConfirm={() =>
          deleting && del.mutate(deleting.id, { onSettled: () => setDeleting(undefined) })
        }
      />
    </div>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  );
}
