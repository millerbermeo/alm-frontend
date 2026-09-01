"use client";

import { useEffect, useState } from "react";

import { IMAGE_STATUS } from "@/config/constants";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { buildFolderTree, flattenTree } from "@/features/folders/tree";
import type { Folder, ImageStatus } from "@/types/api";

export interface ImageFilterState {
  search: string;
  status: "" | ImageStatus;
  format: string;
  folderId: string;
}

export const EMPTY_FILTERS: ImageFilterState = {
  search: "",
  status: "",
  format: "",
  folderId: "",
};

const FORMATS = ["jpg", "png", "webp", "gif", "avif"];

const STATUS_LABEL: Record<ImageStatus, string> = {
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  READY: "Lista",
  FAILED: "Fallida",
};

export function ImageFilters({
  value,
  onChange,
  folders,
}: {
  value: ImageFilterState;
  onChange: (next: ImageFilterState) => void;
  folders: Folder[];
}) {
  const [search, setSearch] = useState(value.search);

  // Debounce the free-text search.
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== value.search) onChange({ ...value, search });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const folderOptions = flattenTree(buildFolderTree(folders)).map(({ folder, depth }) => ({
    value: folder.id,
    label: `${"— ".repeat(depth)}${folder.name}`,
  }));

  return (
    <div className="flex flex-wrap items-end gap-3">
      <TextField
        label="Buscar"
        containerClassName="w-56"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Nombre de archivo o título"
      />

      <SelectField
        label="Estado"
        containerClassName="w-44"
        placeholder="Cualquier estado"
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as "" | ImageStatus })}
        options={IMAGE_STATUS.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
      />

      <SelectField
        label="Formato"
        containerClassName="w-36"
        placeholder="Cualquier formato"
        value={value.format}
        onChange={(e) => onChange({ ...value, format: e.target.value })}
        options={FORMATS.map((f) => ({ value: f, label: f.toUpperCase() }))}
      />

      <SelectField
        label="Carpeta"
        containerClassName="w-48"
        placeholder="Cualquier carpeta"
        value={value.folderId}
        onChange={(e) => onChange({ ...value, folderId: e.target.value })}
        options={folderOptions}
      />

      {(value.search || value.status || value.format || value.folderId) && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            onChange(EMPTY_FILTERS);
          }}
          className="h-10 rounded-lg px-3 text-sm font-medium text-muted hover:text-foreground"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
