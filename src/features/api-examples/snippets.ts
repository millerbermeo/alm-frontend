/**
 * cURL snippet builder for the public image-service API (`/api/v1/images`).
 *
 * These target the Rust API **directly** — the shape an external client
 * (Postman, a script, another backend) uses with a per-project image API key.
 * The panel's own BFF (`/api/images/**`) is session-cookie based and not what
 * you paste into Postman, so it is intentionally not covered here.
 */

export interface SnippetConfig {
  /** Base URL of the Rust image-service, no trailing slash. */
  baseUrl: string;
  /** `img_live_…` / `img_test_…` secret. Falls back to a placeholder. */
  apiKey: string;
  /** Target image id for get / update / delete. */
  imageId: string;
  /** Optional folder id for upload / update. */
  folderId: string;
  /** Local file to upload. */
  filePath: string;
  /** `PUBLIC` | `PRIVATE`. */
  visibility: string;
  /** List query: max rows. */
  limit: number;
  /** List query: free-text search. */
  search: string;
}

export interface Snippet {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  title: string;
  description: string;
  /** Ready to paste into a terminal / Postman "Import > Raw text". */
  curl: string;
}

const KEY_PLACEHOLDER = "img_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const ID_PLACEHOLDER = "00000000-0000-0000-0000-000000000000";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** `\` line continuation so long commands stay readable when pasted. */
function join(lines: string[]): string {
  return lines.join(" \\\n  ");
}

export function buildSnippets(config: SnippetConfig): Snippet[] {
  const base = `${trimTrailingSlash(config.baseUrl || "http://localhost:8080")}/api/v1`;
  const key = config.apiKey.trim() || KEY_PLACEHOLDER;
  const imageId = config.imageId.trim() || ID_PLACEHOLDER;
  const folderId = config.folderId.trim();
  const file = config.filePath.trim() || "./imagen.jpg";
  const visibility = config.visibility || "PUBLIC";
  const auth = `-H "Authorization: Bearer ${key}"`;

  const listQuery = new URLSearchParams();
  if (config.limit) listQuery.set("limit", String(config.limit));
  if (config.search.trim()) listQuery.set("search", config.search.trim());
  const listQs = listQuery.toString();

  const uploadLines = [
    `curl -X POST "${base}/images"`,
    auth,
    `-F "file=@${file}"`,
    `-F "visibility=${visibility}"`,
  ];
  if (folderId) uploadLines.push(`-F "folder_id=${folderId}"`);

  const updateBody: Record<string, unknown> = {
    title: "Título de ejemplo",
    alt_text: "Texto alternativo de ejemplo",
    description: "Descripción de ejemplo",
    visibility,
    folder_id: folderId || null,
  };

  return [
    {
      id: "upload",
      method: "POST",
      title: "Subir imagen",
      description:
        "Carga multipart. `file` es obligatorio; `visibility` y `folder_id` opcionales.",
      curl: join(uploadLines),
    },
    {
      id: "list",
      method: "GET",
      title: "Listar imágenes",
      description:
        "Paginación por cursor. Query opcional: `limit`, `cursor`, `folder_id`, `status`, `format`, `search`, `created_from`, `created_to`.",
      curl: join([
        `curl "${base}/images${listQs ? `?${listQs}` : ""}"`,
        auth,
      ]),
    },
    {
      id: "get",
      method: "GET",
      title: "Obtener una imagen",
      description: "Devuelve metadatos, `url` y `variants` de una imagen.",
      curl: join([`curl "${base}/images/${imageId}"`, auth]),
    },
    {
      id: "update",
      method: "PATCH",
      title: "Editar metadatos",
      description:
        "Todos los campos son opcionales — envía solo los que cambian. `folder_id: null` la mueve a la raíz.",
      curl: join([
        `curl -X PATCH "${base}/images/${imageId}"`,
        auth,
        `-H "Content-Type: application/json"`,
        `-d '${JSON.stringify(updateBody)}'`,
      ]),
    },
    {
      id: "delete",
      method: "DELETE",
      title: "Eliminar imagen",
      description: "Borrado permanente. Responde `204 No Content`.",
      curl: join([`curl -X DELETE "${base}/images/${imageId}"`, auth]),
    },
  ];
}
