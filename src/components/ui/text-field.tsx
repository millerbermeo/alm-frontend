"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Description, ErrorMessage, Input, Label, TextField as HeroTextField } from "@heroui/react";

import { cn } from "@/lib/utils/cn";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: ReactNode;
  /** Validation message. Presence switches the field to the invalid state. */
  error?: string;
  description?: ReactNode;
  isRequired?: boolean;
  containerClassName?: string;
  startContent?: ReactNode;
  endContent?: ReactNode;
}

/**
 * Labelled text input built on HeroUI's RAC `TextField`. Works uncontrolled
 * with React Hook Form (`{...register("field")}`) or controlled.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    error,
    description,
    isRequired,
    id,
    className,
    containerClassName,
    startContent,
    endContent,
    disabled,
    ...inputProps
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = error
    ? `${fieldId}-error`
    : description
      ? `${fieldId}-desc`
      : undefined;

  return (
    <HeroTextField
      isInvalid={Boolean(error)}
      isRequired={isRequired}
      isDisabled={disabled}
      className={cn("flex w-full flex-col gap-1.5", containerClassName)}
    >
      {label ? (
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      ) : null}

      <div className="relative flex items-center">
        {startContent ? (
          <span className="pointer-events-none absolute left-3 text-muted">{startContent}</span>
        ) : null}
        <Input
          {...inputProps}
          id={fieldId}
          ref={ref}
          aria-describedby={describedBy}
          className={cn(
            "w-full",
            startContent && "pl-9",
            endContent && "pr-9",
            className,
          )}
        />
        {endContent ? <span className="absolute right-2 flex items-center">{endContent}</span> : null}
      </div>

      {description && !error ? (
        <Description id={`${fieldId}-desc`} className="text-xs text-muted">
          {description}
        </Description>
      ) : null}
      {error ? (
        <ErrorMessage id={`${fieldId}-error`} className="text-xs font-medium text-danger">
          {error}
        </ErrorMessage>
      ) : null}
    </HeroTextField>
  );
});
