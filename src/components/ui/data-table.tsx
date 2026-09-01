"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { TableSkeleton } from "@/components/ui/skeleton";
import { toMessage } from "@/lib/errors";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  /**
   * Right-aligns the column and renders its cells with tabular figures — use
   * for numbers, sizes, counts and dates so digits line up between rows.
   */
  numeric?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
  empty?: { title: string; description?: ReactNode; action?: ReactNode };
  onRowClick?: (row: T) => void;
  caption?: string;
  /** Min table width before the container scrolls horizontally (tablet). */
  minWidth?: string;
}

/**
 * Semantic table with built-in loading / empty / error states. Kept as a plain
 * `<table>` (not the RAC collection API) for predictable layout control.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isFetching,
  error,
  onRetry,
  empty,
  onRowClick,
  caption,
  minWidth = "44rem",
}: DataTableProps<T>) {
  if (isLoading) return <TableSkeleton cols={columns.length} />;

  if (error) {
    return (
      <Alert status="danger" title="No se pudieron cargar los datos">
        {toMessage(error)}
        {onRetry ? (
          <button onClick={onRetry} className="ml-2 font-medium underline">Reintentar</button>
        ) : null}
      </Alert>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        title={empty?.title ?? "Aquí no hay nada todavía"}
        description={empty?.description}
        action={empty?.action}
      />
    );
  }

  return (
    <div className="relative overflow-x-auto rounded-xl border border-border bg-surface">
      {isFetching ? (
        <div className="absolute inset-x-0 top-0 z-20 h-0.5 animate-pulse bg-accent" aria-hidden />
      ) : null}
      <table className="w-full border-collapse text-sm" style={{ minWidth }}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            {columns.map((c) => {
              const right = c.align === "right" || c.numeric;
              return (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "sticky top-0 z-10 whitespace-nowrap border-b border-border bg-surface-secondary px-4 py-3 font-medium",
                    right && "text-right",
                    c.align === "center" && "text-center",
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "transition-colors",
                onRowClick && "cursor-pointer hover:bg-surface-secondary/60",
              )}
            >
              {columns.map((c) => {
                const right = c.align === "right" || c.numeric;
                return (
                  <td
                    key={c.key}
                    className={cn(
                      "px-4 py-4 align-middle text-foreground",
                      right && "text-right",
                      c.align === "center" && "text-center",
                      c.numeric && "tabular-nums",
                      c.className,
                    )}
                  >
                    {c.cell(row)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
