"use client";

import { Spinner as HeroSpinner } from "@heroui/react";

import { cn } from "@/lib/utils/cn";

/** Centered loading indicator for route/section-level loading states. */
export function LoadingState({
  label = "Cargando…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex min-h-40 flex-col items-center justify-center gap-3 text-muted", className)}
    >
      <HeroSpinner size="lg" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export { HeroSpinner as Spinner };
