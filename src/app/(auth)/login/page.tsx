import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/config/constants";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en el panel de administración de Image Service.",
};

export default function LoginPage() {
  return (
    <AuthFormShell
      title="Iniciar sesión"
      subtitle="Accede a tus proyectos, claves API e imágenes."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href={ROUTES.register} className="font-medium text-accent hover:underline">
            Crear una
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthFormShell>
  );
}
