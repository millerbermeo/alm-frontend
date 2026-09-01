"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ApiError } from "@/lib/errors";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas";
import { useRegister } from "@/features/auth/hooks";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { PasswordField } from "@/components/ui/password-field";

export function RegisterForm() {
  const registerMut = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const formError =
    registerMut.error instanceof ApiError && !registerMut.error.isServer
      ? registerMut.error.message
      : registerMut.error
        ? "No se pudo crear tu cuenta. Inténtalo de nuevo."
        : null;

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => registerMut.mutate(values))}
      noValidate
    >
      {formError ? <Alert status="danger">{formError}</Alert> : null}

      <TextField
        label="Nombre"
        autoComplete="name"
        autoFocus
        isRequired
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        isRequired
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        label="Contraseña"
        autoComplete="new-password"
        isRequired
        description="Al menos 10 caracteres, con una letra y un número."
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        label="Confirmar contraseña"
        autoComplete="new-password"
        isRequired
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" fullWidth isLoading={registerMut.isPending}>
        Crear cuenta
      </Button>
    </form>
  );
}
