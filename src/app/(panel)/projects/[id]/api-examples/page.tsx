import { env } from "@/config/env";
import { CurlExamplesView } from "@/features/api-examples/components/curl-examples-view";

export default async function ProjectApiExamplesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CurlExamplesView projectId={id} defaultBaseUrl={env.RUST_API_URL} />;
}
