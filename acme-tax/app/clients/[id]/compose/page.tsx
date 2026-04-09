import { notFound } from "next/navigation"
import { getClient } from "@/lib/mock-data"
import { ComposeFlow } from "@/components/compose-flow"
import { PageShell } from "@/components/page-shell"

export default async function ComposePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = getClient(id)

  if (!client) notFound()

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  return (
    <PageShell>
      <ComposeFlow client={client} host={host} />
    </PageShell>
  )
}
