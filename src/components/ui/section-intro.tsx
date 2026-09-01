"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface SectionIntroProps {
  /** Stable id — remembers "dismissed" per viewer in localStorage. */
  id: string;
  title: string;
  children: ReactNode;
  /** Optional short "what you can do here" bullets. */
  points?: ReactNode[];
  className?: string;
}

const key = (id: string) => `is-intro:${id}`;
const EVENT = "is-intro:change";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/**
 * A calm explainer panel shown at the top of a section: what it is, why it
 * exists, what you do here. Dismissible per viewer so power users aren't
 * nagged, but always available to learn from on first visit.
 */
export function SectionIntro({ id, title, children, points, className }: SectionIntroProps) {
  const getSnapshot = useCallback(() => {
    try {
      return localStorage.getItem(key(id)) === "1";
    } catch {
      return false;
    }
  }, [id]);

  const dismissed = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const dismiss = () => {
    try {
      localStorage.setItem(key(id), "1");
    } catch {
      /* storage blocked */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  if (dismissed) return null;

  return (
    <aside
      className={cn(
        "relative flex gap-3 rounded-xl border border-border bg-surface-secondary/50 p-4 pr-10 text-sm",
        className,
      )}
    >
      <span
        aria-hidden
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-soft-foreground"
      >
        <InfoIcon />
      </span>
      <div className="min-w-0 space-y-1.5">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="leading-6 text-muted">{children}</p>
        {points && points.length > 0 ? (
          <ul className="mt-1 space-y-1 text-muted">
            {points.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-current" />
                <span className="leading-6">{p}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Ocultar esta explicación"
        title="Ocultar"
        onClick={dismiss}
        className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
      >
        <CloseIcon />
      </button>
    </aside>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
