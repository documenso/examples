import { notFound } from "next/navigation"
import { ParticipantDetail } from "@/components/participant-detail"
import { getParticipant } from "@/lib/mock-data"

export default async function ParticipantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const participant = getParticipant(id)

  if (!participant) {
    notFound()
  }

  return <ParticipantDetail participant={participant} />
}