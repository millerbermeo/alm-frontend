import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { typo } from "@/lib/ui/typography";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Consistent page title block: heading, optional description, right-aligned actions. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className={typo.pageTitle}>{title}</h1>
        {description ? (
          <p className={cn(typo.bodyMuted, "max-w-2xl leading-6")}>{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
