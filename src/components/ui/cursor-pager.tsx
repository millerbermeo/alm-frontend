"use client";

import { Button } from "@/components/ui/button";

interface CursorPagerProps {
  /** Number of items on the current page. */
  count: number;
  hasMore: boolean;
  hasPrev: boolean;
  isFetching?: boolean;
  onNext: () => void;
  onPrev: () => void;
}

/**
 * Prev / Next control for the backend's opaque-cursor pagination (there is no
 * total count or page numbers).
 */
export function CursorPager({
  count,
  hasMore,
  hasPrev,
  isFetching,
  onNext,
  onPrev,
}: CursorPagerProps) {
  if (!hasMore && !hasPrev) return null;
  return (
    <div className="flex items-center justify-between gap-4 pt-1">
      <p className="text-xs text-muted">
        {count} {count === 1 ? "elemento" : "elementos"} en esta página
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onPress={onPrev} isDisabled={!hasPrev || isFetching}>
          Anterior
        </Button>
        <Button size="sm" variant="outline" onPress={onNext} isDisabled={!hasMore || isFetching}>Siguiente</Button>
      </div>
    </div>
  );
}
