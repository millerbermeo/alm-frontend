"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingState } from "@/components/ui/spinner";
import { SectionIntro } from "@/components/ui/section-intro";
import { ProjectStatusBadge } from "@/components/ui/status-badge";
import { useDeleteProject, useProject } from "@/features/projects/hooks";
import { ProjectFormModal } from "@/features/projects/components/project-form-modal";

export function ProjectOverview({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { data: project, isLoading } = useProject(projectId);
  const del = useDeleteProject();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) return <LoadingState />;
  if (!project) return null;

  return (
    <>
      <SectionIntro
        id="project-overview"
        title="Esto es un proyecto"
        points={[
          "Detalles — su nombre, su slug de URL y su estado. Suspender el proyecto bloquea todas sus claves API a la vez.",
          "Claves API — las credenciales que tu aplicación envía para subir y leer imágenes.",
          "Carpetas — un árbol de rutas opcional para organizar las imágenes (como directorios).",
          "Imágenes — sube, explora y obtén variantes optimizadas y sus URLs.",
        ]}
      >
        Usa las pestañas de arriba para gestionar todo lo que pertenece a{" "}
        <strong>{project.name}</strong>. Nada de aquí es visible para otro proyecto.
      </SectionIntro>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Detalles</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onPress={() => setEditOpen(true)}>
                Editar
              </Button>
              <Button size="sm" variant="danger-soft" onPress={() => setDeleteOpen(true)}>
                Eliminar
              </Button>
            </div>
          </CardHeader>
          <CardBody className="divide-y divide-border text-sm">
            <Row label="Nombre" value={project.name} />
            <Row label="Slug" value={<code className="text-muted">{project.slug}</code>} />
            <Row label="Descripción" value={project.description ?? "—"} />
            <Row label="Estado" value={<ProjectStatusBadge status={project.status} />} />
            <Row label="Creado" value={formatDateTime(project.created_at)} />
            <Row label="Actualizado" value={formatDateTime(project.updated_at)} />
          </CardBody>
        </Card>

        <div className="space-y-3">
          <Nav
            title="Claves API"
            body="Credenciales que usan las apps externas para subir y leer imágenes."
            icon={<KeyGlyph />}
            onPress={() => router.push(ROUTES.projectApiKeys(project.id))}
          />
          <Nav
            title="Carpetas"
            body="Organiza las imágenes en un árbol de rutas."
            icon={<FolderGlyph />}
            onPress={() => router.push(ROUTES.projectFolders(project.id))}
          />
          <Nav
            title="Imágenes"
            body="Sube, explora y gestiona las imágenes."
            icon={<ImageGlyph />}
            onPress={() => router.push(ROUTES.projectImages(project.id))}
          />
        </div>
      </div>

      <ProjectFormModal isOpen={editOpen} onOpenChange={setEditOpen} project={project} />

      <ConfirmDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar el proyecto?"
        description={`Se eliminarán «${project.name}» y sus claves API y carpetas. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar proyecto"
        isLoading={del.isPending}
        onConfirm={() =>
          del.mutate(project.id, { onSuccess: () => router.replace(ROUTES.projects) })
        }
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function Nav({
  title,
  body,
  icon,
  onPress,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <button
      onClick={onPress}
      className="group flex w-full items-start gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-accent/60 hover:bg-surface-secondary/60"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-soft-foreground">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
          {title}
          <svg viewBox="0 0 24 24" className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
        <span className="mt-1 block text-sm text-muted">{body}</span>
      </span>
    </button>
  );
}

function KeyGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 8.2-8.2M17 5l2 2M15 7l2 2" />
    </svg>
  );
}
function FolderGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.7 1l.8 1.2a2 2 0 0 0 1.7 1H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  );
}
function ImageGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.6" />
      <path d="m4 16 4.5-4.5a2 2 0 0 1 2.8 0L16 16M14 14l1.5-1.5a2 2 0 0 1 2.8 0L21 15" />
    </svg>
  );
}
