"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { LoadingState } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { toMessage } from "@/lib/errors";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
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
}: DataTableProps<T>) {
  if (isLoading) return <LoadingState label="Cargando…" />;

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
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-accent" aria-hidden />
      ) : null}
      <table className="w-full border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-border bg-surface-secondary/40 text-left text-xs uppercase tracking-wide text-muted">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  "whitespace-nowrap px-4 py-3 font-medium",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
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
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-4 align-middle text-foreground",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.className,
                  )}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
