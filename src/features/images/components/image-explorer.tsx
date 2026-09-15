"use client";

import { useMemo, useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import { ApiError } from "@/lib/errors";
import { toMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { CursorPager } from "@/components/ui/cursor-pager";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SectionIntro } from "@/components/ui/section-intro";
import { SectionHeader } from "@/components/ui/section-header";
import { FolderIcon, ArrowRightIcon } from "@/components/ui/icons";
import { useDeleteFolder, useFolders } from "@/features/folders/hooks";
import { FolderFormModal } from "@/features/folders/components/folder-form-modal";
import { useImageKeyStatus, useImagesList } from "@/features/images/hooks";
import { ImageKeySetup } from "@/features/images/components/image-key-setup";
import { ImageUploader } from "@/features/images/components/image-uploader";
import { ImageCard } from "@/features/images/components/image-card";
import { ImageDetailDrawer } from "@/features/images/components/image-detail-drawer";
import type { Folder, ImageListParams } from "@/types/api";

export function ImageExplorer({ projectId }: { projectId: string }) {
  const keyStatus = useImageKeyStatus(projectId);

  if (keyStatus.isLoading) return <LoadingState label="Comprobando el acceso a imágenes…" />;
  if (!keyStatus.data?.configured) return <ImageKeySetup projectId={projectId} />;

  return <ExplorerModule projectId={projectId} />;
}

function ExplorerModule({ projectId }: { projectId: string }) {
  const folders = useFolders(projectId);
  const deleteFolder = useDeleteFolder(projectId);

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [createUnder, setCreateUnder] = useState<Folder | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [renaming, setRenaming] = useState<Folder | undefined>();
  const [deleting, setDeleting] = useState<Folder | undefined>();

  const byId = useMemo(() => {
    const m = new Map<string, Folder>();
    for (const f of folders.data ?? []) m.set(f.id, f);
    return m;
  }, [folders.data]);

  const current = currentId ? (byId.get(currentId) ?? null) : null;

  // Walk the parent chain for the breadcrumb — cheap, folder trees are shallow.
  const breadcrumb = useMemo(() => {
    const chain: Folder[] = [];
    let f = current;
    while (f) {
      chain.unshift(f);
      f = f.parent_id ? (byId.get(f.parent_id) ?? null) : null;
    }
    return chain;
  }, [current, byId]);

  const children = useMemo(
    () => (folders.data ?? []).filter((f) => (f.parent_id ?? null) === currentId),
    [folders.data, currentId],
  );

  function navigate(id: string | null) {
    setCurrentId(id);
    setCursorStack([]);
  }

  const params: ImageListParams = useMemo(
    () =>
      currentId
        ? { cursor: cursorStack.at(-1), limit: DEFAULT_PAGE_SIZE, folder_id: currentId }
        : { cursor: cursorStack.at(-1), limit: DEFAULT_PAGE_SIZE, root_only: true },
    [currentId, cursorStack],
  );

  const query = useImagesList(projectId, params);
  const items = query.data?.items ?? [];
  const keyError = query.error instanceof ApiError && query.error.code === "IMAGE_KEY_MISSING";

  if (keyError) return <ImageKeySetup projectId={projectId} />;

  const empty = children.length === 0 && items.length === 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Explorador"
        description="Navega las carpetas e imágenes de este proyecto como un árbol de archivos."
        actions={
          <>
            <Button
              variant="outline"
              onPress={() => {
                setCreateUnder(current ?? undefined);
                setRenaming(undefined);
                setCreateOpen(true);
              }}
            >
              Nueva carpeta
            </Button>
            <Button onPress={() => setShowUploader((v) => !v)}>
              {showUploader ? "Ocultar carga" : "Subir aquí"}
            </Button>
          </>
        }
      />

      <SectionIntro
        id="explorer"
        title="Navega como en un explorador de archivos"
        points={[
          "Haz clic en una carpeta para entrar; usa la ruta de arriba para volver atrás.",
          "«Subir aquí» y «Nueva carpeta» actúan sobre la carpeta que tienes abierta.",
          "Es la misma organización de las pestañas Carpetas e Imágenes — solo cambia cómo la recorres.",
        ]}
      >
        Explora las carpetas de este proyecto igual que en un gestor de archivos: entra, sube y crea
        subcarpetas sin salir de la vista.
      </SectionIntro>

      {/* Breadcrumb */}
      <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 text-sm">
        <button
          type="button"
          onClick={() => navigate(null)}
          className={
            currentId === null
              ? "font-semibold text-foreground"
              : "text-muted hover:text-foreground"
          }
        >
          Proyecto
        </button>
        {breadcrumb.map((f) => (
          <span key={f.id} className="flex items-center gap-1.5">
            <ArrowRightIcon className="size-3.5 text-muted" />
            <button
              type="button"
              onClick={() => navigate(f.id)}
              className={
                f.id === currentId
                  ? "font-semibold text-foreground"
                  : "text-muted hover:text-foreground"
              }
            >
              {f.name}
            </button>
          </span>
        ))}
      </nav>

      {showUploader ? (
        <ImageUploader
          projectId={projectId}
          folders={folders.data ?? []}
          defaultFolderId={currentId ?? undefined}
        />
      ) : null}

      {folders.error ? (
        <Alert status="danger" title="No se pudieron cargar las carpetas">
          {toMessage(folders.error)}
        </Alert>
      ) : null}

      {query.isLoading ? (
        <LoadingState label="Cargando…" />
      ) : query.error ? (
        <Alert status="danger" title="No se pudieron cargar las imágenes">
          {toMessage(query.error)}
        </Alert>
      ) : empty ? (
        <EmptyState
          title="Esta carpeta está vacía"
          description="Crea una subcarpeta o sube imágenes aquí."
          action={<Button onPress={() => setShowUploader(true)}>Subir aquí</Button>}
        />
      ) : (
        <div className="space-y-4">
          {children.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {children.map((f) => (
                <div
                  key={f.id}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 hover:border-accent/60 hover:bg-surface-secondary/60"
                >
                  <button
                    type="button"
                    onClick={() => navigate(f.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <FolderIcon className="size-5 shrink-0 text-accent" />
                    <span className="truncate text-sm font-medium text-foreground">{f.name}</span>
                  </button>
                  <div className="hidden shrink-0 gap-1 group-hover:flex">
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() => {
                        setRenaming(f);
                        setCreateOpen(true);
                      }}
                    >
                      Renombrar
                    </Button>
                    <Button size="sm" variant="danger-soft" onPress={() => setDeleting(f)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((image) => (
                <ImageCard key={image.id} image={image} onOpen={() => setSelectedImage(image.id)} />
              ))}
            </div>
          ) : null}
        </div>
      )}

      <CursorPager
        count={items.length}
        hasMore={query.data?.has_more ?? false}
        hasPrev={cursorStack.length > 0}
        isFetching={query.isFetching}
        onNext={() => {
          const next = query.data?.next_cursor;
          if (next) setCursorStack((s) => [...s, next]);
        }}
        onPrev={() => setCursorStack((s) => s.slice(0, -1))}
      />

      <ImageDetailDrawer
        projectId={projectId}
        imageId={selectedImage}
        folders={folders.data ?? []}
        onClose={() => setSelectedImage(null)}
      />

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
        isLoading={deleteFolder.isPending}
        onConfirm={() =>
          deleting &&
          deleteFolder.mutate(deleting.id, {
            onSettled: () => setDeleting(undefined),
          })
        }
      />
    </div>
  );
}
