"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { ROUTES } from "@/config/constants";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/lib/store/ui-store";
import { Logo } from "@/components/ui/logo";
import {
  BoxIcon,
  ChevronLeftIcon,
  CloseIcon,
  GearIcon,
  GridIcon,
  MenuIcon,
} from "@/components/ui/icons";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import type { UserView } from "@/types/api";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface NavGroup {
  /** Shown as an uppercase caption above the group (hidden when collapsed). */
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "General",
    items: [
      { href: ROUTES.dashboard, label: "Panel", icon: <GridIcon /> },
      { href: ROUTES.projects, label: "Proyectos", icon: <BoxIcon /> },
    ],
  },
  {
    label: "Cuenta",
    items: [{ href: ROUTES.settings, label: "Ajustes", icon: <GearIcon /> }],
  },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PanelShell({ user, children }: { user: UserView; children: ReactNode }) {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebar);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // `mounted` keeps the drawer in the DOM through its exit transition;
  // `entered` toggles the open-position classes one frame after mount so the
  // slide/fade actually animates.
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);

  // Mount as soon as the drawer is asked to open (adjusting state during
  // render is the supported pattern; the exit is handled by the effect below).
  if (drawerOpen && !mounted) setMounted(true);

  // Lock scroll and wire Escape while the mobile drawer is open. It closes on
  // navigation via the nav container's click handler below.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Drive the enter/exit animation around the open intent.
  useEffect(() => {
    if (drawerOpen) {
      const id = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(id);
    }
    const id = requestAnimationFrame(() => setEntered(false));
    const t = setTimeout(() => setMounted(false), 300);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(t);
    };
  }, [drawerOpen]);

  const nav = (
    <div className="flex-1 space-y-6 overflow-y-auto p-3">
      {NAV.map((group) => (
        <div key={group.label} className="space-y-1">
          {!collapsed ? (
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {group.label}
            </p>
          ) : null}
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              collapsed={collapsed}
            />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      {/* ---- Desktop sidebar ------------------------------------------------ */}
      <aside
        className={cn(
          "sticky top-0 z-30 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface",
          "transition-[width] duration-200 ease-out md:flex",
          collapsed ? "w-[4.25rem]" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-border",
            collapsed ? "justify-center px-0" : "px-4",
          )}
        >
          <Link href={ROUTES.dashboard} aria-label="Image Service" className="min-w-0">
            <Logo showWord={!collapsed} />
          </Link>
        </div>

        {nav}

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted",
              "transition-colors hover:bg-surface-secondary hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <ChevronLeftIcon className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Contraer</span>}
          </button>
        </div>
      </aside>

      {/* ---- Mobile drawer ----------------------------------------------------- */}
      {mounted ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setDrawerOpen(false)}
            className={cn(
              "absolute inset-0 bg-black/50 backdrop-blur-sm",
              "transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
              entered ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            className={cn(
              "absolute inset-y-0 left-0 flex w-[17rem] max-w-[82%] flex-col border-r border-border bg-surface shadow-overlay",
              "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform motion-reduce:transition-none",
              entered ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Logo />
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setDrawerOpen(false)}
                className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-secondary hover:text-foreground"
              >
                <CloseIcon />
              </button>
            </div>
            <div onClick={() => setDrawerOpen(false)} className="flex flex-1 flex-col overflow-hidden">
              {nav}
            </div>
            <div className="border-t border-border p-3">
              <ThemeToggle className="w-full justify-center" />
            </div>
          </div>
        </div>
      ) : null}

      {/* ---- Main column ----------------------------------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur-md md:px-6">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setDrawerOpen(true)}
            className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-secondary hover:text-foreground md:hidden"
          >
            <MenuIcon />
          </button>
          <Link href={ROUTES.dashboard} aria-label="Image Service" className="md:hidden">
            <Logo showWord={false} />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle className="hidden sm:flex" />
            <UserMenu user={user} />
          </div>
        </header>

        <main className="flex-1">
          <div className="container-page page-stack py-6 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavLink({
  item,
  active,
  collapsed = false,
}: {
  item: NavItem;
  active: boolean;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-accent-soft text-accent-soft-foreground"
          : "text-muted hover:bg-surface-secondary hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <span className="grid size-5 shrink-0 place-items-center [&_svg]:size-5">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
