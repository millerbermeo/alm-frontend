/**
 * Shared constants. Safe to import from both server and client.
 */

export const APP_NAME = "Panel de Image Service";
export const APP_DESCRIPTION =
  "Panel de administración de Image Service — proyectos, claves API, carpetas e imágenes.";

/** Cookie names owned by the BFF layer. */
export const COOKIE = {
  access: "is_at",
  refresh: "is_rt",
  /** Encrypted map of `{ [projectId]: apiKeySecret }` for the images module. */
  imageKeys: "is_ik",
} as const;

/** Access-token cookie lifetime (s). The Rust access token lives 2 hours. */
export const ACCESS_COOKIE_MAX_AGE = 2 * 60 * 60;
/** Refresh-token cookie lifetime (s). The Rust refresh token lives 60 days. */
export const REFRESH_COOKIE_MAX_AGE = 60 * 24 * 60 * 60;

/** Cursor-paginated list page size used across the panel. */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const ROLE = {
  superAdmin: "SUPER_ADMIN",
  admin: "ADMIN",
  user: "USER",
} as const;

export const IMAGE_PERMISSIONS = [
  "images:read",
  "images:upload",
  "images:update",
  "images:delete",
  "images:transform",
] as const;

export const PROJECT_STATUS = ["ACTIVE", "SUSPENDED", "ARCHIVED"] as const;
export const IMAGE_STATUS = ["PENDING", "PROCESSING", "READY", "FAILED"] as const;
export const IMAGE_VISIBILITY = ["PUBLIC", "PRIVATE"] as const;

/** Routes the panel navigates to. */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  projects: "/projects",
  project: (id: string) => `/projects/${id}`,
  projectApiKeys: (id: string) => `/projects/${id}/api-keys`,
  projectFolders: (id: string) => `/projects/${id}/folders`,
  projectImages: (id: string) => `/projects/${id}/images`,
  projectApiExamples: (id: string) => `/projects/${id}/api-examples`,
  settings: "/settings",
} as const;
