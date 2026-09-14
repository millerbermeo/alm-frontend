"use client";

import type { ReactNode } from "react";
import { Dialog, Modal as RACModal, ModalOverlay } from "react-aria-components";

import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE: Record<Size, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export interface ModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: Size;
  /** Block backdrop / Esc dismissal while a mutation is running. */
  isDismissable?: boolean;
}

/**
 * Accessible modal dialog built directly on React Aria Components (focus trap,
 * scroll lock, Esc, aria wiring) with our own Tailwind skin.
 */
export function Modal({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  isDismissable = true,
}: ModalProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={!isDismissable}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm",
        "data-[entering]:animate-in data-[entering]:fade-in data-[exiting]:animate-out data-[exiting]:fade-out",
      )}
    >
      <RACModal
        className={cn(
          "w-full rounded-2xl border border-border bg-overlay text-overlay-foreground shadow-overlay",
          "data-[entering]:animate-in data-[entering]:zoom-in-95 data-[exiting]:animate-out data-[exiting]:zoom-out-95",
          SIZE[size],
        )}
      >
        <Dialog className="flex max-h-[85vh] flex-col outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="space-y-1">
              <h2 slot="title" className="text-base font-semibold text-foreground">
                {title}
              </h2>
              {description ? <p className="text-sm text-muted">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar"
              className="rounded-lg p-1 text-muted hover:bg-surface-secondary hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              {footer}
            </div>
          ) : null}
        </Dialog>
      </RACModal>
    </ModalOverlay>
  );
}
