"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { IMAGE_VISIBILITY } from "@/config/constants";
import { queryKeys } from "@/lib/query/keys";
import { toMessage } from "@/lib/errors";
import { formatBytes } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
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
  defaultFolderId,
}: {
  projectId: string;
  folders: Folder[];
  /** Pre-select a folder (e.g. the one currently open in the explorer). */
  defaultFolderId?: string;
}) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Pending[]>([]);
  const [visibility, setVisibility] = useState<ImageVisibility>("PRIVATE");
  const [folderId, setFolderId] = useState(defaultFolderId ?? "");
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
  const totalBytes = items.reduce((sum, p) => sum + p.file.size, 0);
  const doneCount = items.filter((p) => p.status === "done").length;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
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
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          dragOver
            ? "border-accent bg-accent-soft/40"
            : "border-border hover:border-accent/50 hover:bg-surface-secondary",
        )}
      >
        <div
          className={cn(
            "grid size-11 place-items-center rounded-full transition-colors",
            dragOver ? "bg-accent text-white" : "bg-accent-soft text-accent-soft-foreground",
          )}
        >
          <IconUploadCloud className="size-5" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Arrastra imágenes aquí o{" "}
          <span className="text-accent underline-offset-2 group-hover:underline">haz clic para elegir</span>
        </p>
        <p className="text-xs text-muted">JPEG, PNG, WebP, GIF · hasta el límite del proyecto</p>
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
          <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg bg-surface-secondary/60 p-3">
            <div className="flex flex-wrap items-end gap-3">
              <SelectField
                label="Visibilidad"
                containerClassName="w-40"
                className="h-9 bg-surface"
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
                className="h-9 bg-surface"
                placeholder="Sin carpeta"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                options={folderOptions}
              />
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted">
                {items.length} {items.length === 1 ? "archivo" : "archivos"} · {formatBytes(totalBytes)}
                {doneCount > 0 ? ` · ${doneCount} subido${doneCount === 1 ? "" : "s"}` : ""}
              </p>
              <Button onPress={uploadAll} isLoading={running} isDisabled={pendingCount === 0}>
                Subir {pendingCount || ""}
              </Button>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {items.map((item) => (
              <li
                key={item.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-surface-secondary"
              >
                <div className="relative aspect-square w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt="" className="size-full object-cover" />

                  {item.status === "idle" ? (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Quitar ${item.file.name}`}
                      className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                    >
                      <IconX className="size-3.5" />
                    </button>
                  ) : null}

                  {item.status === "done" ? (
                    <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-success text-white">
                      <IconCheck className="size-3.5" />
                    </span>
                  ) : null}

                  {item.status === "error" ? (
                    <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-danger text-white">
                      <IconAlert className="size-3.5" />
                    </span>
                  ) : null}

                  {item.status === "uploading" ? (
                    <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1.5 backdrop-blur-sm">
                      <div className="mb-1 flex items-center justify-between text-[10px] font-medium text-white">
                        <span>Subiendo…</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-white/25">
                        <div
                          className="h-full rounded-full bg-white transition-[width]"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1 p-2 text-xs">
                  <p className="truncate font-medium text-foreground" title={item.file.name}>
                    {item.file.name}
                  </p>
                  {item.status === "error" ? (
                    <span title={item.error} className="block max-w-full">
                      <Badge tone="danger" className="max-w-full truncate">
                        {item.error}
                      </Badge>
                    </span>
                  ) : (
                    <p className="text-muted">{formatBytes(item.file.size)}</p>
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

function IconUploadCloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        d="M7 18a4.5 4.5 0 0 1-.5-8.975A5.5 5.5 0 0 1 17.34 7.02 4 4 0 0 1 17 15h-1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 12v9m0-9 3 3m-3-3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path d="M12 8v5" strokeLinecap="round" />
      <path d="M12 16.5v.01" strokeLinecap="round" />
      <path
        d="M10.29 3.86 1.82 18a1 1 0 0 0 .87 1.5h18.62a1 1 0 0 0 .87-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
