import { LoadingState } from "@/components/ui/spinner";

export default function RootLoading() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <LoadingState label="Cargando…" />
    </div>
  );
}
