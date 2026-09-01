"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ApiError } from "@/lib/errors";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { useLogin } from "@/features/auth/hooks";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { PasswordField } from "@/components/ui/password-field";

const LAST_EMAIL_KEY = "auth:last-email";

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_EMAIL_KEY);
      if (saved) setValue("email", saved);
    } catch {
      // localStorage unavailable (private mode, blocked) — skip prefill
    }
  }, [setValue]);

  const formError =
    login.error instanceof ApiError && !login.error.isServer
      ? login.error.message
      : login.error
        ? "No se pudo iniciar sesión. Inténtalo de nuevo."
        : null;

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => {
        try {
          localStorage.setItem(LAST_EMAIL_KEY, values.email);
        } catch {
          // localStorage unavailable — proceed without persisting
        }
        login.mutate(values);
      })}
      noValidate
    >
      {formError ? <Alert status="danger">{formError}</Alert> : null}

      <TextField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        autoFocus
        isRequired
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        label="Contraseña"
        autoComplete="current-password"
        isRequired
        error={errors.password?.message}
        {...register("password")}
      />

      <Button type="submit" fullWidth isLoading={login.isPending}>
        Iniciar sesión
      </Button>
    </form>
  );
}
