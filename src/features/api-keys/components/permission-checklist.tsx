"use client";

import { IMAGE_PERMISSIONS } from "@/config/constants";
import { cn } from "@/lib/utils/cn";
import type { ImagePermission } from "@/types/api";

const META: Record<ImagePermission, { label: string; hint: string }> = {
  "images:read": { label: "Leer", hint: "Listar y obtener imágenes y sus variantes" },
  "images:upload": { label: "Subir", hint: "Crear imágenes nuevas" },
  "images:update": { label: "Actualizar", hint: "Editar metadatos y mover entre carpetas" },
  "images:delete": { label: "Eliminar", hint: "Borrar imágenes" },
  "images:transform": { label: "Transformar", hint: "Pedir transformaciones al vuelo" },
};

interface Props {
  value: ImagePermission[];
  onChange: (next: ImagePermission[]) => void;
  error?: string;
}

export function PermissionChecklist({ value, onChange, error }: Props) {
  function toggle(p: ImagePermission) {
    onChange(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);
  }

  return (
    <fieldset className="space-y-2">
      <div className="flex items-center justify-between">
        <legend className="text-sm font-medium text-foreground">Permisos</legend>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            className="font-medium text-accent hover:underline"
            onClick={() => onChange(["images:read", "images:upload", "images:update", "images:delete"])}
          >Recomendados</button>
          <button
            type="button"
            className="font-medium text-muted hover:underline"
            onClick={() => onChange([])}
          >Limpiar</button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {IMAGE_PERMISSIONS.map((p) => {
          const checked = value.includes(p);
          return (
            <label
              key={p}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors",
                checked
                  ? "border-accent bg-accent-soft/40"
                  : "border-border hover:bg-surface-secondary",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(p)}
                className="mt-0.5 size-4 accent-[var(--color-accent)]"
              />
              <span>
                <span className="block font-medium text-foreground">{META[p].label}</span>
                <span className="block text-xs text-muted">{META[p].hint}</span>
                <code className="mt-0.5 block text-[11px] text-muted">{p}</code>
              </span>
            </label>
          );
        })}
      </div>

      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
    </fieldset>
  );
}
