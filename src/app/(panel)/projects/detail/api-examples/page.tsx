"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { env } from "@/config/env";
import { CurlExamplesView } from "@/features/api-examples/components/curl-examples-view";
import { LoadingState } from "@/components/ui/spinner";

function ProjectApiExamplesPageInner() {
  const id = useSearchParams().get("id") ?? "";
  return <CurlExamplesView projectId={id} defaultBaseUrl={env.NEXT_PUBLIC_API_URL} />;
}

export default function ProjectApiExamplesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProjectApiExamplesPageInner />
    </Suspense>
  );
}
