import { z } from "zod";

/**
 * Client + BFF validation for the auth forms. Mirrors the backend rules
 * (`common::validation`): email shape, password ≥ 10 chars with a letter and a
 * digit, name 1–120 chars.
 */

const email = z
  .string()
  .trim()
  .min(3, "Introduce tu correo electrónico")
  .max(320, "El correo es demasiado largo")
  .email("Introduce un correo electrónico válido");

const password = z
  .string()
  .min(10, "La contraseña debe tener al menos 10 caracteres")
  .max(200, "La contraseña es demasiado larga")
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
    message: "La contraseña debe contener letras y números",
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Introduce tu contraseña"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Introduce tu nombre").max(120, "El nombre es demasiado largo"),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;
