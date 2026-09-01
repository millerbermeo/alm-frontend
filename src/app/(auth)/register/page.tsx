import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/config/constants";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea una cuenta del panel de Image Service.",
};

export default function RegisterPage() {
  return (
    <AuthFormShell
      title="Crear cuenta"
      subtitle="La primera cuenta creada será la de superadministrador."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href={ROUTES.login} className="font-medium text-accent hover:underline">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthFormShell>
  );
}
