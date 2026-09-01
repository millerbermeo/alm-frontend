import type { ApiEnvelope } from "@/types/api";

/**
 * Normalised API error. Thrown by the client HTTP layer and rendered by the
 * shared error UI. `code` is the backend's stable machine code
 * (`VALIDATION_ERROR`, `NOT_FOUND`, …); `status` the HTTP status.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errorId?: string;

  constructor(params: { status: number; code: string; message: string; errorId?: string }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.errorId = params.errorId;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isForbidden(): boolean {
    return this.status === 403;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }
  get isConflict(): boolean {
    return this.status === 409;
  }
  get isRateLimited(): boolean {
    return this.status === 429;
  }
  get isServer(): boolean {
    return this.status >= 500;
  }
}

const FRIENDLY_BY_STATUS: Record<number, string> = {
  400: "La petición no es válida.",
  401: "Tu sesión ha caducado. Inicia sesión de nuevo.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No se encontró el recurso solicitado.",
  409: "Esto entra en conflicto con datos existentes.",
  413: "El archivo es demasiado grande.",
  415: "Ese tipo de archivo no está admitido.",
  422: "Algunos campos no son válidos.",
  429: "Demasiadas peticiones — ve más despacio.",
  500: "Algo falló de nuestro lado. Inténtalo de nuevo.",
  502: "No se puede contactar con el servidor. Inténtalo en un momento.",
  503: "Un servicio necesario no está disponible temporalmente.",
};

/** Build an {@link ApiError} from a fetch `Response` + parsed body. */
export function apiErrorFromResponse(status: number, body: unknown): ApiError {
  const envelope = isEnvelope(body) ? body : undefined;
  const message =
    envelope?.message?.trim() ||
    FRIENDLY_BY_STATUS[status] ||
    `La petición falló (${status}).`;
  return new ApiError({
    status,
    code: envelope?.code ?? httpCodeName(status),
    message,
    errorId: envelope?.error_id,
  });
}

/** A safe, user-facing string for any thrown value. */
export function toMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return "Error inesperado. Inténtalo de nuevo.";
}

function isEnvelope(v: unknown): v is ApiEnvelope<unknown> {
  return (
    typeof v === "object" &&
    v !== null &&
    "code" in v &&
    "message" in v &&
    typeof (v as Record<string, unknown>).message === "string"
  );
}

function httpCodeName(status: number): string {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "INTERNAL_ERROR";
  return "BAD_REQUEST";
}
