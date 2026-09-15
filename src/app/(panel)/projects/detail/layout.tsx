"use client";

import { Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import { ProjectHeader } from "@/features/projects/components/project-header";
import { LoadingState } from "@/components/ui/spinner";

function ProjectLayoutInner({ children }: { children: ReactNode }) {
  const id = useSearchParams().get("id") ?? "";
  return (
    <div className="space-y-6">
      <ProjectHeader projectId={id} />
      {children}
    </div>
  );
}

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProjectLayoutInner>{children}</ProjectLayoutInner>
    </Suspense>
  );
}
