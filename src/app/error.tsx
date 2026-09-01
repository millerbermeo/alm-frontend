"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-sm font-semibold text-danger">Algo salió mal</p>
        <h1 className="text-xl font-semibold text-foreground">
          No se pudo mostrar la página
        </h1>
        <p className="text-sm text-muted">
          Ocurrió un error inesperado. Puedes reintentar o volver al panel.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted">ref: {error.digest}</p>
        ) : null}
        <div className="flex justify-center gap-3">
          <Button variant="outline" onPress={() => reset()}>
            Reintentar
          </Button>
          <Button onPress={() => router.push(ROUTES.dashboard)}>Ir al panel</Button>
        </div>
      </div>
    </div>
  );
}
