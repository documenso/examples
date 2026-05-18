import { notFound, redirect } from "next/navigation"

import { SignEmbed } from "@/components/sign-embed"
import { PageShell } from "@/components/page-shell"
import { getClient } from "@/lib/mock-data"

export default async function SignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { id } = await params
  const { token } = await searchParams
  const client = getClient(id)

  if (!client) notFound()
  if (!token) redirect(`/clients/${id}`)

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  return (
    <PageShell>
      <SignEmbed client={client} host={host} token={token} />
    </PageShell>
  )
}
