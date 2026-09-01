"use client";

import type { ReactNode } from "react";
import { Button as HeroButton, type ButtonProps as HeroButtonProps, Spinner } from "@heroui/react";

import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends Omit<HeroButtonProps, "children"> {
  children?: ReactNode;
  /** Shows a spinner and disables interaction. */
  isLoading?: boolean;
  /** Icon rendered before the label. */
  startContent?: ReactNode;
  endContent?: ReactNode;
}

/**
 * App button. Thin wrapper over HeroUI's RAC `Button` that adds a loading
 * state and left/right icon slots. Variants: primary | secondary | tertiary |
 * outline | ghost | danger | danger-soft.
 */
export function Button({
  isLoading = false,
  isDisabled,
  startContent,
  endContent,
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <HeroButton
      {...props}
      variant={variant}
      isDisabled={isDisabled || isLoading}
      className={cn("inline-flex items-center justify-center gap-2", className)}
    >
      {isLoading ? <Spinner size="sm" aria-hidden /> : startContent}
      {children}
      {!isLoading && endContent}
    </HeroButton>
  );
}
