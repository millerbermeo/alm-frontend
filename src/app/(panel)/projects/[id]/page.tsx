import type { Metadata } from "next";

import { ApiError } from "@/lib/errors";
import { rustFetchAuthed, unwrap } from "@/lib/server/rust-api";
import type { Project } from "@/types/api";
import { ProjectOverview } from "@/features/projects/components/project-overview";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const project = unwrap<Project>(await rustFetchAuthed({ path: `/projects/${id}` }));
    return { title: project.name };
  } catch (err) {
    if (err instanceof ApiError && err.isNotFound) return { title: "Project not found" };
    return { title: "Project" };
  }
}

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectOverview projectId={id} />;
}
