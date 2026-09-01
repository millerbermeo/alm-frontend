import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { typo } from "@/lib/ui/typography";

interface FormSectionProps {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  /** Field grid columns on `sm+`. Default 1. */
  columns?: 1 | 2;
  className?: string;
}

/**
 * Groups related form fields under an optional heading. Keeps label-above +
 * consistent vertical gap so every form in the panel is laid out the same way.
 */
export function FormSection({
  title,
  description,
  children,
  columns = 1,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {title || description ? (
        <div className="space-y-1">
          {title ? <h3 className={typo.label}>{title}</h3> : null}
          {description ? <p className={typo.caption}>{description}</p> : null}
        </div>
      ) : null}
      <div
        className={cn(
          "grid gap-4",
          columns === 2 && "sm:grid-cols-2",
        )}
      >
        {children}
      </div>
    </section>
  );
}
