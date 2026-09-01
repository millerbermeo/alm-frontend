import type { SVGProps } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Central icon set for the panel chrome. One consistent grid (24), stroke
 * weight (2) and size (`size-5`, overridable via `className`). Import from here
 * instead of hand-rolling an `<svg>` per file so the sidebar, nav cards and
 * empty states stay visually uniform.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Base({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-5 shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export function GridIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Base>
  );
}

export function BoxIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </Base>
  );
}

export function GearIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.62.78 1.02 1.42 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Base>
  );
}

export function KeyIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 8.2-8.2M17 5l2 2M15 7l2 2" />
    </Base>
  );
}

export function FolderIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.7 1l.8 1.2a2 2 0 0 0 1.7 1H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </Base>
  );
}

export function ImageIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.6" />
      <path d="m4 16 4.5-4.5a2 2 0 0 1 2.8 0L16 16M14 14l1.5-1.5a2 2 0 0 1 2.8 0L21 15" />
    </Base>
  );
}

export function MenuIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Base>
  );
}

export function CloseIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  );
}

export function ChevronLeftIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m15 18-6-6 6-6" />
    </Base>
  );
}

export function ArrowRightIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Base>
  );
}
