"use client";

import { useMemo, useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import { ApiError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { CursorPager } from "@/components/ui/cursor-pager";
import { SectionIntro } from "@/components/ui/section-intro";
import { SectionHeader } from "@/components/ui/section-header";
import { toMessage } from "@/lib/errors";
import { useFolders } from "@/features/folders/hooks";
import { useImageKeyStatus, useImagesList } from "@/features/images/hooks";
import { ImageKeySetup } from "@/features/images/components/image-key-setup";
import { ImageUploader } from "@/features/images/components/image-uploader";
import {
  ImageFilters,
  EMPTY_FILTERS,
  type ImageFilterState,
} from "@/features/images/components/image-filters";
import { ImageCard } from "@/features/images/components/image-card";
import { ImageDetailDrawer } from "@/features/images/components/image-detail-drawer";
import type { ImageListParams } from "@/types/api";

export function ImagesView({ projectId }: { projectId: string }) {
  const keyStatus = useImageKeyStatus(projectId);

  if (keyStatus.isLoading) return <LoadingState label="Comprobando el acceso a imágenes…" />;
  if (!keyStatus.data?.configured) return <ImageKeySetup projectId={projectId} />;

  return <ImagesModule projectId={projectId} />;
}

function ImagesModule({ projectId }: { projectId: string }) {
  const folders = useFolders(projectId);
  const [filters, setFilters] = useState<ImageFilterState>(EMPTY_FILTERS);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const params: ImageListParams = useMemo(
    () => ({
      cursor: cursorStack.at(-1),
      limit: DEFAULT_PAGE_SIZE,
      search: filters.search || undefined,
      status: filters.status || undefined,
      format: filters.format || undefined,
      folder_id: filters.folderId || undefined,
    }),
    [cursorStack, filters],
  );

  const query = useImagesList(projectId, params);

  function updateFilters(next: ImageFilterState) {
    setCursorStack([]);
    setFilters(next);
  }

  const items = query.data?.items ?? [];
  const keyError =
    query.error instanceof ApiError && query.error.code === "IMAGE_KEY_MISSING";

  if (keyError) return <ImageKeySetup projectId={projectId} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Imágenes"
        description="Sube, organiza y gestiona las imágenes de este proyecto."
        actions={
          <>
            <Button variant="outline" onPress={() => setShowKey((v) => !v)}>
              Clave de imagen
            </Button>
            <Button onPress={() => setShowUploader((v) => !v)}>
              {showUploader ? "Ocultar carga" : "Subir"}
            </Button>
          </>
        }
      />

      <SectionIntro
        id="images"
        title="Súbela una vez, sírvela en todas partes"
        points={[
          "Al subir, el servicio guarda el original y genera variantes optimizadas (redimensionadas, WebP/AVIF).",
          "Cada imagen tiene una URL que tu aplicación usa directamente; las privadas se sirven con URLs firmadas.",
          "Usa el botón Clave de imagen si las subidas fallan por falta de clave — este navegador necesita la clave de subida del proyecto.",
          "Filtra por carpeta, estado o visibilidad para encontrar imágenes.",
        ]}
      >
        Aquí subes y gestionas los archivos de imagen de este proyecto y obtienes las URLs que
        renderiza tu aplicación.
      </SectionIntro>

      {showKey ? <ImageKeySetup projectId={projectId} /> : null}

      {showUploader ? (
        <ImageUploader projectId={projectId} folders={folders.data ?? []} />
      ) : null}

      <ImageFilters value={filters} onChange={updateFilters} folders={folders.data ?? []} />

      {query.isLoading ? (
        <LoadingState label="Cargando imágenes…" />
      ) : query.error ? (
        <Alert status="danger" title="No se pudieron cargar las imágenes">
          {toMessage(query.error)}
        </Alert>
      ) : items.length === 0 ? (
        <EmptyState
          title={
            filters.search || filters.status || filters.format || filters.folderId
              ? "Ninguna imagen coincide con estos filtros"
              : "Aún no hay imágenes"
          }
          description="Usa el botón Subir para añadir imágenes a este proyecto."
          action={<Button onPress={() => setShowUploader(true)}>Subir</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((image) => (
            <ImageCard key={image.id} image={image} onOpen={() => setSelected(image.id)} />
          ))}
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
        imageId={selected}
        folders={folders.data ?? []}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
