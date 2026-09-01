import { ImagesView } from "@/features/images/components/images-view";

export default async function ProjectImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ImagesView projectId={id} />;
}
