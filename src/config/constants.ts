/**
 * Shared constants. Safe to import from both server and client.
 */

export const APP_NAME = "Panel de Image Service";
export const APP_DESCRIPTION =
  "Panel de administración de Image Service — proyectos, claves API, carpetas e imágenes.";

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

/**
 * Routes the panel navigates to. Project detail routes carry the id as a
 * query string (`?id=`), not a path segment — static export requires
 * `generateStaticParams` for dynamic path segments, and project ids only
 * exist at runtime, so the id is resolved client-side via `useSearchParams`.
 */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  projects: "/projects",
  project: (id: string) => `/projects/detail?id=${id}`,
  projectApiKeys: (id: string) => `/projects/detail/api-keys?id=${id}`,
  projectFolders: (id: string) => `/projects/detail/folders?id=${id}`,
  projectImages: (id: string) => `/projects/detail/images?id=${id}`,
  projectApiExamples: (id: string) => `/projects/detail/api-examples?id=${id}`,
  settings: "/settings",
} as const;
