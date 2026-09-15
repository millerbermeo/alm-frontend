"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ApiKeysView } from "@/features/api-keys/components/api-keys-view";
import { LoadingState } from "@/components/ui/spinner";

function ProjectApiKeysPageInner() {
  const id = useSearchParams().get("id") ?? "";
  return <ApiKeysView projectId={id} />;
}

export default function ProjectApiKeysPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProjectApiKeysPageInner />
    </Suspense>
  );
}
