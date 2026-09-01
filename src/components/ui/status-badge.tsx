import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { ImageStatus, ProjectStatus } from "@/types/api";

const PROJECT: Record<ProjectStatus, { tone: BadgeTone; label: string }> = {
  ACTIVE: { tone: "success", label: "Activo" },
  SUSPENDED: { tone: "warning", label: "Suspendido" },
  ARCHIVED: { tone: "neutral", label: "Archivado" },
};

const IMAGE: Record<ImageStatus, { tone: BadgeTone; label: string }> = {
  PENDING: { tone: "neutral", label: "Pendiente" },
  PROCESSING: { tone: "info", label: "Procesando" },
  READY: { tone: "success", label: "Lista" },
  FAILED: { tone: "danger", label: "Fallida" },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const s = PROJECT[status];
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}

export function ImageStatusBadge({ status }: { status: ImageStatus }) {
  const s = IMAGE[status];
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}
