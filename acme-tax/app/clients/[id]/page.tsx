import { notFound } from "next/navigation"

import { ClientDetail } from "@/components/client-detail"
import { getClient } from "@/lib/mock-data"

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = getClient(id)

  if (!client) notFound()

  return <ClientDetail client={client} />
}
