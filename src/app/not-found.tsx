import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-sm font-semibold text-accent">404</p>
        <h1 className="text-xl font-semibold text-foreground">Página no encontrada</h1>
        <p className="text-sm text-muted">
          La página que buscas no existe o se ha movido.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
