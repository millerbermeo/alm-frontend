"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { IMAGE_VISIBILITY } from "@/config/constants";
import { queryKeys } from "@/lib/query/keys";
import { toMessage } from "@/lib/errors";
import { formatBytes } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { toast } from "@/components/ui/toast";
import { imagesApi } from "@/features/images/api";
import { buildFolderTree, flattenTree } from "@/features/folders/tree";
import type { Folder, ImageVisibility } from "@/types/api";

const VISIBILITY_LABEL: Record<ImageVisibility, string> = {
  PUBLIC: "Pública",
  PRIVATE: "Privada",
};

interface Pending {
  id: string;
  file: File;
  preview: string;
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

export function ImageUploader({
  projectId,
  folders,
}: {
  projectId: string;
  folders: Folder[];
}) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Pending[]>([]);
  const [visibility, setVisibility] = useState<ImageVisibility>("PRIVATE");
  const [folderId, setFolderId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [running, setRunning] = useState(false);

  const folderOptions = flattenTree(buildFolderTree(folders)).map(({ folder, depth }) => ({
    value: folder.id,
    label: `${"— ".repeat(depth)}${folder.name}`,
  }));

  function addFiles(files: FileList | File[]) {
    const next: Pending[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        preview: URL.createObjectURL(file),
        status: "idle",
        progress: 0,
      }));
    setItems((prev) => [...prev, ...next]);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function uploadAll() {
    setRunning(true);
    for (const item of items) {
      if (item.status === "done") continue;
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "uploading", progress: 0 } : p)),
      );
      const form = new FormData();
      form.append("file", item.file);
      form.append("visibility", visibility);
      if (folderId) form.append("folder_id", folderId);
      try {
        await imagesApi.upload(projectId, form, (e) => {
          const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
          setItems((prev) =>
            prev.map((p) => (p.id === item.id ? { ...p, progress: pct } : p)),
          );
        });
        setItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: "done", progress: 100 } : p)),
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, status: "error", error: toMessage(err) } : p,
          ),
        );
      }
    }
    setRunning(false);
    qc.invalidateQueries({ queryKey: queryKeys.images.all });
    const failed = items.filter((p) => p.status === "error").length;
    if (!failed) {
      toast.success("Carga completada");
      setItems((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.preview));
        return [];
      });
    }
  }

  const pendingCount = items.filter((p) => p.status !== "done").length;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-6 text-center text-sm transition-colors",
          dragOver ? "border-accent bg-accent-soft/40" : "border-border hover:bg-surface-secondary",
        )}
      >
        <span className="font-medium text-foreground">Arrastra imágenes aquí o haz clic para elegir</span>
        <span className="text-xs text-muted">JPEG, PNG, WebP, GIF · hasta el límite del proyecto</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {items.length > 0 ? (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <SelectField
              label="Visibilidad"
              containerClassName="w-40"
              className="h-9"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ImageVisibility)}
              options={IMAGE_VISIBILITY.map((v) => ({
                value: v,
                label: VISIBILITY_LABEL[v],
              }))}
            />
            <SelectField
              label="Carpeta"
              containerClassName="w-48"
              className="h-9"
              placeholder="Sin carpeta"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              options={folderOptions}
            />
            <Button onPress={uploadAll} isLoading={running} isDisabled={pendingCount === 0}>
              Subir {pendingCount || ""}
            </Button>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {items.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.preview}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <div className="space-y-1 p-2 text-xs">
                  <p className="truncate font-medium text-foreground">{item.file.name}</p>
                  <p className="text-muted">{formatBytes(item.file.size)}</p>
                  {item.status === "uploading" ? (
                    <div className="h-1 overflow-hidden rounded bg-surface-secondary">
                      <div
                        className="h-full bg-accent transition-[width]"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  ) : item.status === "done" ? (
                    <p className="font-medium text-success">Hecho</p>
                  ) : item.status === "error" ? (
                    <p className="truncate font-medium text-danger" title={item.error}>
                      {item.error}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="font-medium text-muted hover:text-danger"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
