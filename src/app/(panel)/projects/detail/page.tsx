"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ProjectOverview } from "@/features/projects/components/project-overview";
import { LoadingState } from "@/components/ui/spinner";

function ProjectOverviewPageInner() {
  const id = useSearchParams().get("id") ?? "";
  return <ProjectOverview projectId={id} />;
}

export default function ProjectOverviewPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProjectOverviewPageInner />
    </Suspense>
  );
}
