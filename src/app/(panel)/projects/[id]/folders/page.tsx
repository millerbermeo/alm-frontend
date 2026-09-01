import { FoldersView } from "@/features/folders/components/folders-view";

export default async function ProjectFoldersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FoldersView projectId={id} />;
}
