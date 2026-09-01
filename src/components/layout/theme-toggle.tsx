"use client";

import { useUiStore, type ThemePreference } from "@/lib/store/ui-store";
import { cn } from "@/lib/utils/cn";

const ORDER: ThemePreference[] = ["light", "dark", "system"];
const LABEL: Record<ThemePreference, string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
};

/** Cycles light → dark → system. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={cn(
        "flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-muted",
        "transition-colors hover:bg-surface-secondary hover:text-foreground",
        className,
      )}
      aria-label={`Tema: ${LABEL[theme]}. Cambiar a ${LABEL[next]}.`}
      title={`Tema: ${LABEL[theme]}`}
    >
      <ThemeIcon theme={theme} />
      <span className="hidden sm:inline">{LABEL[theme]}</span>
    </button>
  );
}

function ThemeIcon({ theme }: { theme: ThemePreference }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "size-4",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (theme === "light") {
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }
  if (theme === "dark") {
    return (
      <svg {...common} aria-hidden>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden>
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  );
}
