"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PROJECT_STATUS } from "@/config/constants";
import { ApiError } from "@/lib/errors";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { SelectField } from "@/components/ui/select-field";
import { Alert } from "@/components/ui/alert";
import { projectFormSchema, type ProjectFormValues } from "@/features/projects/schemas";
import { useCreateProject, useUpdateProject } from "@/features/projects/hooks";
import type { Project, ProjectStatus } from "@/types/api";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  ARCHIVED: "Archivado",
};

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set the modal edits this project; otherwise it creates a new one. */
  project?: Project;
  onSaved?: (project: Project) => void;
}

function defaults(project?: Project): ProjectFormValues {
  return {
    name: project?.name ?? "",
    slug: "",
    description: project?.description ?? "",
    status: project?.status ?? "ACTIVE",
  };
}

export function ProjectFormModal({ isOpen, onOpenChange, project, onSaved }: Props) {
  const isEdit = Boolean(project);
  const create = useCreateProject();
  const update = useUpdateProject(project?.id ?? "");
  const mutation = isEdit ? update : create;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaults(project),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaults(project));
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, project?.id]);

  const formError =
    mutation.error instanceof ApiError && !mutation.error.isServer
      ? mutation.error.message
      : mutation.error
        ? "No se pudo guardar el proyecto. Inténtalo de nuevo."
        : null;

  function submit(v: ProjectFormValues) {
    const onSuccess = (p: Project) => {
      onSaved?.(p);
      onOpenChange(false);
    };
    if (isEdit) {
      update.mutate(
        { name: v.name, description: v.description || undefined, status: v.status },
        { onSuccess },
      );
    } else {
      create.mutate(
        { name: v.name, slug: v.slug || undefined, description: v.description || undefined },
        { onSuccess },
      );
    }
  }

  const { errors } = form.formState;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar proyecto" : "Nuevo proyecto"}
      description={
        isEdit ? undefined : "Un proyecto agrupa las claves API, las carpetas y las imágenes de una app."
      }
      isDismissable={!mutation.isPending}
      footer={
        <>
          <Button variant="ghost" onPress={() => onOpenChange(false)} isDisabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="project-form" isLoading={mutation.isPending}>
            {isEdit ? "Guardar cambios" : "Crear proyecto"}
          </Button>
        </>
      }
    >
      <form id="project-form" className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
        {formError ? <Alert status="danger">{formError}</Alert> : null}

        <TextField
          label="Nombre"
          isRequired
          autoFocus
          placeholder="Ecommerce"
          error={errors.name?.message}
          {...form.register("name")}
        />

        {!isEdit ? (
          <TextField
            label="Slug"
            description="Opcional. Se genera a partir del nombre si lo dejas vacío."
            placeholder="ecommerce"
            error={errors.slug?.message}
            {...form.register("slug")}
          />
        ) : (
          <SelectField
            label="Estado"
            options={PROJECT_STATUS.map((s) => ({
              value: s,
              label: STATUS_LABEL[s],
            }))}
            error={errors.status?.message}
            {...form.register("status")}
          />
        )}

        <TextareaField
          label="Descripción"
          placeholder="Para qué sirve este proyecto"
          error={errors.description?.message}
          {...form.register("description")}
        />
      </form>
    </Modal>
  );
}
