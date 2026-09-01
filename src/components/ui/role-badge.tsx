import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types/api";

const STYLES: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-accent-soft text-accent-soft-foreground",
  ADMIN: "bg-success-soft text-success-soft-foreground",
  USER: "bg-surface-secondary text-muted",
};

const LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: "Superadmin",
  ADMIN: "Admin",
  USER: "Usuario",
};

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STYLES[role],
        className,
      )}
    >
      {LABEL[role]}
    </span>
  );
}
