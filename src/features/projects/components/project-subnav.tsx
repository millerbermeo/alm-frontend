"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { cn } from "@/lib/utils/cn";

export function ProjectSubnav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: ROUTES.project(projectId), label: "Resumen", exact: true },
    { href: ROUTES.projectApiKeys(projectId), label: "Claves API" },
    { href: ROUTES.projectFolders(projectId), label: "Carpetas" },
    { href: ROUTES.projectImages(projectId), label: "Imágenes" },
    { href: ROUTES.projectExplorer(projectId), label: "Explorador" },
    { href: ROUTES.projectApiExamples(projectId), label: "Ejemplos cURL" },
  ];

  return (
    <nav className="flex gap-1 border-b border-border">
      {tabs.map((t) => {
        // `pathname` never includes the query string, but our hrefs carry
        // `?id=` — compare against the path portion only.
        const hrefPath = t.href.split("?")[0] ?? t.href;
        const active = t.exact ? pathname === hrefPath : pathname.startsWith(hrefPath);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
