"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { DEFAULT_PAGE_SIZE, PROJECT_STATUS, ROUTES } from "@/config/constants";
import { formatDate } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { CursorPager } from "@/components/ui/cursor-pager";
import { SelectField } from "@/components/ui/select-field";
import { SectionIntro } from "@/components/ui/section-intro";
import { ProjectStatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProjectFormModal } from "@/features/projects/components/project-form-modal";
import { useDeleteProject, useProjectsList } from "@/features/projects/hooks";
import type { Project, ProjectStatus } from "@/types/api";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  ARCHIVED: "Archivado",
};

export function ProjectsView() {
  const router = useRouter();
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const cursor = cursorStack.at(-1);
  const [statusFilter, setStatusFilter] = useState<"" | ProjectStatus>("");

  const query = useProjectsList({ cursor, limit: DEFAULT_PAGE_SIZE });
  const del = useDeleteProject();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [deleting, setDeleting] = useState<Project | undefined>();

  const rows = useMemo(() => {
    const items = query.data?.items ?? [];
    return statusFilter ? items.filter((p) => p.status === statusFilter) : items;
  }, [query.data, statusFilter]);

  const columns: Column<Project>[] = [
    {
      key: "name",
      header: "Nombre",
      cell: (p) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{p.name}</span>
          <span className="text-xs text-muted">{p.slug}</span>
        </div>
      ),
    },
    { key: "status", header: "Estado", cell: (p) => <ProjectStatusBadge status={p.status} /> },
    {
      key: "description",
      header: "Descripción",
      cell: (p) => (
        <span className="line-clamp-1 max-w-xs text-muted">{p.description ?? "—"}</span>
      ),
    },
    { key: "created", header: "Creado", numeric: true, cell: (p) => formatDate(p.created_at) },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (p) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onPress={() => router.push(ROUTES.projectApiKeys(p.id))}>
            Claves API
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => {
              setEditing(p);
              setFormOpen(true);
            }}
          >
            Editar
          </Button>
          <Button size="sm" variant="danger-soft" onPress={() => setDeleting(p)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Proyectos"
        description="Cada proyecto agrupa sus propias claves API, carpetas e imágenes."
        actions={
          <Button
            onPress={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            Nuevo proyecto
          </Button>
        }
      />

      <SectionIntro
        id="projects-list"
        title="¿Qué es un proyecto?"
        points={[
          "Cada aplicación a la que sirves imágenes (una web, una app móvil, un cliente) tiene su propio proyecto.",
          "Todo lo de dentro — claves API, carpetas, imágenes — pertenece a un solo proyecto y nunca se mezcla con otros.",
          "Abre un proyecto para gestionar sus claves, su árbol de carpetas y sus imágenes.",
        ]}
      >
        Un proyecto es un espacio aislado. Agrupa las claves API, las carpetas y las imágenes de una
        sola aplicación para que nada se comparta entre ellas.
      </SectionIntro>

      <div className="flex flex-wrap items-end gap-3">
        <SelectField
          label="Estado"
          containerClassName="w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | ProjectStatus)}
          placeholder="Todos los estados"
          options={PROJECT_STATUS.map((s) => ({
            value: s,
            label: STATUS_LABEL[s],
          }))}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(p) => p.id}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={(p) => router.push(ROUTES.project(p.id))}
        empty={{
          title: statusFilter ? "No hay proyectos con este estado" : "Aún no hay proyectos",
          description: statusFilter
            ? "Quita el filtro para ver todos los proyectos."
            : "Crea tu primer proyecto para empezar a emitir claves API.",
          action: statusFilter ? undefined : (
            <Button
              onPress={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
            >
              Nuevo proyecto
            </Button>
          ),
        }}
      />

      <CursorPager
        count={rows.length}
        hasMore={query.data?.has_more ?? false}
        hasPrev={cursorStack.length > 0}
        isFetching={query.isFetching}
        onNext={() => {
          const next = query.data?.next_cursor;
          if (next) setCursorStack((s) => [...s, next]);
        }}
        onPrev={() => setCursorStack((s) => s.slice(0, -1))}
      />

      <ProjectFormModal
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        project={editing}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title="¿Eliminar el proyecto?"
        description={
          deleting
            ? `Se eliminarán «${deleting.name}» y sus claves API y carpetas. Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar proyecto"
        isLoading={del.isPending}
        onConfirm={() => {
          if (!deleting) return;
          del.mutate(deleting.id, { onSuccess: () => setDeleting(undefined) });
        }}
      />
    </>
  );
}
