"use client";

import { use, type ReactNode } from "react";

import { ProjectHeader } from "@/features/projects/components/project-header";

export default function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <ProjectHeader projectId={id} />
      {children}
    </div>
  );
}
