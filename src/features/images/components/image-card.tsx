"use client";

import { formatBytes } from "@/lib/utils/format";
import { ImageStatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import type { ImageView } from "@/types/api";

export function thumbUrl(image: ImageView): string | null {
  return (
    image.variants.thumbnail ??
    image.variants.small ??
    image.variants.medium ??
    image.url ??
    null
  );
}

export function ImageCard({ image, onOpen }: { image: ImageView; onOpen: () => void }) {
  const url = thumbUrl(image);

  return (
    <button
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface text-left transition-colors hover:border-accent"
    >
      <div className="relative aspect-square w-full bg-surface-secondary">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={image.alt_text ?? image.original_filename}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-xs text-muted">
            {image.status === "FAILED" ? "Fallida" : "Procesando…"}
          </div>
        )}
        <div className="absolute left-2 top-2">
          <ImageStatusBadge status={image.status} />
        </div>
        <div className="absolute right-2 top-2">
          <Badge tone={image.visibility === "PUBLIC" ? "info" : "neutral"}>
            {image.visibility === "PUBLIC" ? "Pública" : "Privada"}
          </Badge>
        </div>
      </div>
      <div className="space-y-0.5 p-2.5 text-xs">
        <p className="truncate font-medium text-foreground">
          {image.title || image.original_filename}
        </p>
        <p className="text-muted">
          {image.format.toUpperCase()} · {formatBytes(image.size_bytes)}
          {image.width && image.height ? ` · ${image.width}×${image.height}` : ""}
        </p>
      </div>
    </button>
  );
}
