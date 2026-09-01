import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { typo } from "@/lib/ui/typography";

interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
  /** Right-aligned actions (usually a single primary Button). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Sub-page / tab-level heading. One notch below `PageHeader` in the hierarchy
 * (section weight, not page weight) so nested screens — the project tabs, the
 * settings panels — all read the same instead of each rolling its own `<h2>`.
 */
export function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className={typo.sectionTitle}>{title}</h2>
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
