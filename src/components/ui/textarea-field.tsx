"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
  containerClassName?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField(
    { label, error, description, id, className, containerClassName, rows = 3, ...rest },
    ref,
  ) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label ? (
          <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <textarea
          {...rest}
          id={fieldId}
          ref={ref}
          rows={rows}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "w-full rounded-field border border-field-border bg-field px-3 py-2 text-sm text-field-foreground",
            "placeholder:text-field-placeholder focus-visible:outline-2 focus-visible:outline-focus",
            error && "border-danger",
            className,
          )}
        />
        {description && !error ? <p className="text-xs text-muted">{description}</p> : null}
        {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
      </div>
    );
  },
);
