"use client";

import Link from "next/link";
import { Skeleton } from "@heroui/react";

import { ROUTES } from "@/config/constants";
import { typo } from "@/lib/ui/typography";
import { ProjectStatusBadge } from "@/components/ui/status-badge";
import { Alert } from "@/components/ui/alert";
import { toMessage } from "@/lib/errors";
import { useProject } from "@/features/projects/hooks";
import { ProjectSubnav } from "@/features/projects/components/project-subnav";

/** Breadcrumb + title + status shown on every `/projects/[id]/*` page. */
export function ProjectHeader({ projectId }: { projectId: string }) {
  const { data: project, isLoading, error } = useProject(projectId);

  // Fixed-height skeleton so switching tabs never shifts the page below.
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-8 w-64 rounded" />
        <Skeleton className="h-9 w-full max-w-md rounded" />
      </div>
    );
  }
  if (error) return <Alert status="danger" title="Proyecto no encontrado">{toMessage(error)}</Alert>;
  if (!project) return null;

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-1.5 text-sm text-muted">
        <Link href={ROUTES.projects} className="hover:text-foreground">Proyectos</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{project.name}</span>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className={typo.pageTitle}>{project.name}</h1>
        <ProjectStatusBadge status={project.status} />
        <code className="rounded bg-surface-secondary px-1.5 py-0.5 text-xs text-muted">
          {project.slug}
        </code>
      </div>

      <ProjectSubnav projectId={projectId} />
    </div>
  );
}
