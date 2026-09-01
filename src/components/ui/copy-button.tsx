"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { toast } from "@/components/ui/toast";

/** Copies `value` to the clipboard with transient visual + toast feedback. */
export function CopyButton({
  value,
  label = "Copiar",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.warning("No se pudo acceder al portapapeles");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium",
        "text-muted hover:bg-surface-secondary hover:text-foreground",
        className,
      )}
    >
      {copied ? "Copiado" : label}
    </button>
  );
}
