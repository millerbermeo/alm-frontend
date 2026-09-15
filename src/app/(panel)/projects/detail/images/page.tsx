"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ImagesView } from "@/features/images/components/images-view";
import { LoadingState } from "@/components/ui/spinner";

function ProjectImagesPageInner() {
  const id = useSearchParams().get("id") ?? "";
  return <ImagesView projectId={id} />;
}

export default function ProjectImagesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProjectImagesPageInner />
    </Suspense>
  );
}
