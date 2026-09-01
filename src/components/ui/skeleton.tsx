"use client";

import { Skeleton } from "@heroui/react";

import { cn } from "@/lib/utils/cn";

/** Single shimmer line. `w` / `h` via className. */
export function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4 w-full rounded", className)} />;
}

/** Placeholder for a `Card` while its data loads. */
export function CardSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-5", className)}>
      <Skeleton className="mb-4 h-4 w-32 rounded" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn("h-3 rounded", i === lines - 1 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

/** Placeholder matching the `DataTable` shell: bordered box, header, rows. */
export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-surface"
      role="status"
      aria-label="Cargando datos"
    >
      <div className="flex gap-4 border-b border-border bg-surface-secondary/40 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1 rounded" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-4 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn("h-4 flex-1 rounded", c === 0 && "max-w-[40%]")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
