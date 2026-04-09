import { notFound } from "next/navigation"
import { ParticipantAudit } from "@/components/participant-audit"
import { getParticipant } from "@/lib/mock-data"

export default async function ParticipantAuditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const participant = getParticipant(id)

  if (!participant) {
    notFound()
  }

  return <ParticipantAudit participant={participant} />
}
