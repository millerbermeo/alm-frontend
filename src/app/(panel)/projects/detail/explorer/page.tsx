"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ImageExplorer } from "@/features/images/components/image-explorer";
import { LoadingState } from "@/components/ui/spinner";

function ProjectExplorerPageInner() {
  const id = useSearchParams().get("id") ?? "";
  return <ImageExplorer projectId={id} />;
}

export default function ProjectExplorerPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProjectExplorerPageInner />
    </Suspense>
  );
}
