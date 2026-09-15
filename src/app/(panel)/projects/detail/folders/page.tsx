"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { FoldersView } from "@/features/folders/components/folders-view";
import { LoadingState } from "@/components/ui/spinner";

function ProjectFoldersPageInner() {
  const id = useSearchParams().get("id") ?? "";
  return <FoldersView projectId={id} />;
}

export default function ProjectFoldersPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProjectFoldersPageInner />
    </Suspense>
  );
}
