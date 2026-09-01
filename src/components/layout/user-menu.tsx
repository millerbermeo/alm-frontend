"use client";

import { useEffect, useRef, useState } from "react";

import { useLogout } from "@/features/auth/hooks";
import { cn } from "@/lib/utils/cn";
import { RoleBadge } from "@/components/ui/role-badge";
import type { UserView } from "@/types/api";

/** Avatar button that opens an identity + sign-out popover. */
export function UserMenu({ user }: { user: UserView }) {
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú de cuenta"
        className={cn(
          "flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors sm:pr-3",
          "hover:bg-surface-secondary",
          open && "bg-surface-secondary",
        )}
      >
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent-soft-foreground"
        >
          {initial}
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block truncate text-sm font-medium leading-tight text-foreground">
            {user.name}
          </span>
          <span className="block truncate text-xs leading-tight text-muted">{user.email}</span>
        </span>
        <ChevronDown className={cn("hidden size-4 text-muted transition-transform sm:block", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-border bg-surface shadow-overlay"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <span className="mt-2 inline-flex">
              <RoleBadge role={user.role} />
            </span>
          </div>
          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger",
                "transition-colors hover:bg-danger-soft disabled:opacity-60",
              )}
            >
              <LogoutIcon />
              {logout.isPending ? "Cerrando sesión…" : "Cerrar sesión"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
