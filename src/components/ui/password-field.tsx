"use client";

import { forwardRef, useState } from "react";

import { TextField, type TextFieldProps } from "@/components/ui/text-field";

/** Text field with a show/hide toggle. */
export const PasswordField = forwardRef<HTMLInputElement, Omit<TextFieldProps, "type">>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <TextField
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        endContent={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="rounded px-2 py-1 text-xs font-medium text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {visible ? "Ocultar" : "Mostrar"}
          </button>
        }
      />
    );
  },
);
