"use client";

import { Alert as HeroAlert } from "@heroui/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type Status = "default" | "success" | "warning" | "danger";

export interface AlertProps {
  status?: Status;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Inline, non-dismissable status message. For transient feedback use `toast`. */
export function Alert({ status = "default", title, children, className }: AlertProps) {
  return (
    <HeroAlert status={status} className={cn("w-full", className)}>
      <HeroAlert.Indicator />
      <HeroAlert.Content>
        {title ? <HeroAlert.Title>{title}</HeroAlert.Title> : null}
        {children ? <HeroAlert.Description>{children}</HeroAlert.Description> : null}
      </HeroAlert.Content>
    </HeroAlert>
  );
}
