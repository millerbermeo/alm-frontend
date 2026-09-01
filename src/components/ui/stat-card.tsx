import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { typo } from "@/lib/ui/typography";

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Small qualifier under the value (e.g. "v1.2.0 · 4 min"). */
  hint?: ReactNode;
  /** Signed change / status. `tone` picks the semantic color. */
  delta?: { text: string; tone: "success" | "danger" | "muted" };
  /** Leading status dot color, when a value alone doesn't carry state. */
  dotTone?: "success" | "danger";
  className?: string;
}

const DELTA_CLASS: Record<NonNullable<StatCardProps["delta"]>["tone"], string> = {
  success: "text-success",
  danger: "text-danger",
  muted: "text-muted",
};

const DOT_CLASS: Record<NonNullable<StatCardProps["dotTone"]>, string> = {
  success: "bg-success",
  danger: "bg-danger",
};

/** KPI tile: discreet label, large value, optional semantic delta. */
export function StatCard({ label, value, hint, delta, dotTone, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className={typo.caption}>{label}</span>
        {dotTone ? (
          <span className={cn("size-2 rounded-full", DOT_CLASS[dotTone])} aria-hidden />
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {delta ? (
        <p className={cn("mt-1 text-xs font-medium", DELTA_CLASS[delta.tone])}>{delta.text}</p>
      ) : hint ? (
        <p className={cn("mt-1", typo.caption)}>{hint}</p>
      ) : null}
    </div>
  );
}
