import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * App card primitive. HeroUI ships a `Card` compound component; we use a plain
 * styled element here for full layout control in list/detail/stat contexts.
 */
export function Card({
  className,
  children,
  interactive = false,
}: {
  className?: string;
  children: ReactNode;
  /** Adds hover affordance — use when the whole card is a link/button. */
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface text-surface-foreground",
        interactive &&
          "transition-colors hover:border-accent/60 hover:bg-surface-secondary/60",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 border-b border-border px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h3 className={cn("text-sm font-semibold text-foreground", className)}>{children}</h3>;
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("border-t border-border px-5 py-3 text-sm text-muted", className)}>
      {children}
    </div>
  );
}
