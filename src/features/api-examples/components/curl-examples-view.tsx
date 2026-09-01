"use client";

import { useMemo, useState } from "react";

import { SectionIntro } from "@/components/ui/section-intro";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { CopyButton } from "@/components/ui/copy-button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { buildSnippets, type SnippetConfig } from "@/features/api-examples/snippets";

const METHOD_TONE: Record<string, BadgeTone> = {
  GET: "accent",
  POST: "success",
  PATCH: "warning",
  DELETE: "danger",
};

export function CurlExamplesView({
  projectId,
  defaultBaseUrl,
}: {
  projectId: string;
  defaultBaseUrl: string;
}) {
  const [config, setConfig] = useState<SnippetConfig>({
    baseUrl: defaultBaseUrl,
    apiKey: "",
    imageId: "",
    folderId: "",
    filePath: "./imagen.jpg",
    visibility: "PUBLIC",
    limit: 20,
    search: "",
  });

  const set = <K extends keyof SnippetConfig>(key: K, value: SnippetConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const snippets = useMemo(() => buildSnippets(config), [config]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Ejemplos cURL</h2>
        <p className="text-sm text-muted">
          Comandos listos para pegar en Postman o la terminal y probar carga, listado, edición y
          eliminación de imágenes contra la API pública.
        </p>
      </div>

      <SectionIntro
        id="api-examples"
        title="Prueba la API con tu clave de imagen"
        points={[
          "Van directos a la API Rust (`/api/v1/images`), no al panel. Autentican con una clave del proyecto.",
          "Crea o copia una clave `img_live_…` / `img_test_…` en la pestaña Claves API.",
          "Rellena los campos de abajo — los comandos se regeneran solos. Usa el botón Copiar de cada tarjeta.",
          "En Postman: Import > Raw text y pega el comando cURL completo.",
        ]}
      >
        Esta pestaña arma comandos <code>curl</code> con tus valores para que verifiques el flujo de
        imágenes sin escribir código.
      </SectionIntro>

      <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
        <TextField
          label="Base URL de la API"
          value={config.baseUrl}
          onChange={(e) => set("baseUrl", e.target.value)}
          placeholder="http://localhost:8080"
        />
        <TextField
          label="Clave de imagen (Bearer)"
          value={config.apiKey}
          onChange={(e) => set("apiKey", e.target.value)}
          placeholder="img_live_…"
          description="Pestaña Claves API. Nunca se guarda — vive solo en esta pantalla."
        />
        <TextField
          label="ID de imagen (get / editar / eliminar)"
          value={config.imageId}
          onChange={(e) => set("imageId", e.target.value)}
          placeholder="uuid de una imagen existente"
        />
        <TextField
          label="ID de carpeta (opcional)"
          value={config.folderId}
          onChange={(e) => set("folderId", e.target.value)}
          placeholder="dejar vacío = raíz"
        />
        <TextField
          label="Ruta del archivo a subir"
          value={config.filePath}
          onChange={(e) => set("filePath", e.target.value)}
          placeholder="./imagen.jpg"
        />
        <SelectField
          label="Visibilidad"
          value={config.visibility}
          onChange={(e) => set("visibility", e.target.value)}
          options={[
            { value: "PUBLIC", label: "Pública" },
            { value: "PRIVATE", label: "Privada" },
          ]}
        />
        <TextField
          label="Listado — limit"
          type="number"
          min={1}
          max={100}
          value={String(config.limit)}
          onChange={(e) => set("limit", Number(e.target.value) || 0)}
        />
        <TextField
          label="Listado — search"
          value={config.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="texto a buscar (opcional)"
        />
      </div>

      <p className="text-xs text-muted">
        Proyecto <code className="font-mono">{projectId}</code> — la API deduce el proyecto de la
        clave, por eso no aparece en la URL.
      </p>

      <div className="space-y-3">
        {snippets.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Badge tone={METHOD_TONE[s.method]} className="font-mono">
                {s.method}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="truncate text-xs text-muted">{s.description}</p>
              </div>
              <CopyButton value={s.curl} label="Copiar" />
            </div>
            <pre className="overflow-x-auto bg-surface-secondary/40 px-4 py-3 text-xs leading-6 text-foreground">
              <code className="font-mono">{s.curl}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
