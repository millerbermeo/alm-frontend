/**
 * TypeScript mirrors of the Rust backend DTOs (`image-service`).
 * Kept deliberately close to the Rust `serde` output — do not add fields the
 * API does not return.
 */

// --- envelope -------------------------------------------------------------

/** Every backend response is wrapped in this envelope. */
export interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T | null;
  error_id?: string;
}

/** Cursor-paginated list payload (`common::pagination::Page`). */
export interface Page<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}

// --- auth / users ------------------------------------------------------------

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export interface UserView {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_token_expires_at: number;
}

/** `POST /auth/register` and `POST /auth/login` payload (tokens are flattened). */
export interface AuthResult extends TokenPair {
  user: UserView;
}

// --- projects --------------------------------------------------------------

export type ProjectStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectBody {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateProjectBody {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

// --- api keys ------------------------------------------------------------

export type ImagePermission =
  | "images:read"
  | "images:upload"
  | "images:update"
  | "images:delete"
  | "images:transform";

export interface ApiKeyView {
  id: string;
  project_id: string;
  name: string;
  key_prefix: string;
  permissions: ImagePermission[];
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

/** Returned once, on create/rotate — carries the full secret. */
export interface ApiKeySecret extends ApiKeyView {
  secret: string;
}

export interface CreateApiKeyBody {
  name: string;
  test?: boolean;
  permissions: ImagePermission[];
  expires_at?: string;
}

export interface RotateApiKeyBody {
  grace_seconds?: number;
}

// --- folders ------------------------------------------------------------

export interface Folder {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  path: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFolderBody {
  project_id: string;
  name: string;
  parent_id?: string;
}

export interface UpdateFolderBody {
  name: string;
}

// --- images ------------------------------------------------------------

export type ImageStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";
export type ImageVisibility = "PUBLIC" | "PRIVATE";

export interface ImageView {
  id: string;
  project_id: string;
  folder_id: string | null;
  original_filename: string;
  mime_type: string;
  format: string;
  width: number | null;
  height: number | null;
  size_bytes: number;
  checksum: string;
  status: ImageStatus;
  visibility: ImageVisibility;
  alt_text: string | null;
  title: string | null;
  description: string | null;
  error?: string | null;
  url: string | null;
  variants: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface UpdateImageBody {
  folder_id?: string | null;
  visibility?: ImageVisibility;
  alt_text?: string;
  title?: string;
  description?: string;
}

export interface ImageListParams {
  cursor?: string;
  limit?: number;
  folder_id?: string;
  status?: ImageStatus;
  format?: string;
  search?: string;
  created_from?: string;
  created_to?: string;
}

// --- health ------------------------------------------------------------

export interface Health {
  status: string;
  uptime_seconds: number;
  version: string;
}

export interface Readiness {
  status: string;
  database: string;
  redis: string;
  storage: string;
  queue_depth: number | null;
}
