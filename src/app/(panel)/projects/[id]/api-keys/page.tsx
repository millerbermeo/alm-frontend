import { ApiKeysView } from "@/features/api-keys/components/api-keys-view";

export default async function ProjectApiKeysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApiKeysView projectId={id} />;
}
