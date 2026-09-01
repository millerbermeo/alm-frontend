"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  description?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

/** Native `<select>` with the app field skin. RHF-compatible via `register`. */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, description, options, placeholder, id, className, containerClassName, ...rest },
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
      <select
        {...rest}
        id={fieldId}
        ref={ref}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "h-10 w-full rounded-field border border-field-border bg-field px-3 text-sm text-field-foreground",
          "focus-visible:outline-2 focus-visible:outline-focus",
          error && "border-danger",
          className,
        )}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {description && !error ? <p className="text-xs text-muted">{description}</p> : null}
      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
});
