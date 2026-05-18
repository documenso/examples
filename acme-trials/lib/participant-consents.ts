import { format } from "date-fns"
import type { Participant, ParticipantStatus } from "@/lib/mock-data"

export interface ParticipantConsentRecord {
  participantId: string
  envelopeId: string
  documentId: number | null
  email: string
  consentedAt: string
  signedAt: string | null
}

export type StoredParticipantConsents = Partial<
  Record<string, ParticipantConsentRecord>
 >

export function deriveParticipantStatus(
  participant: Participant,
  record?: ParticipantConsentRecord | null,
): {
  status: ParticipantStatus
  consentDate: string | null
} {
  if (!record) {
    return {
      status: participant.status,
      consentDate: participant.consentDate,
    }
  }

  return {
    status: "consented",
    consentDate: record.consentedAt,
  }
}

export function formatParticipantConsentTimestamp(
  value: string | null,
  options?: {
    empty?: string | null
    pattern?: string
  },
) {
  if (!value) {
    return options?.empty ?? "—"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return format(date, options?.pattern ?? "MMM d, yyyy · h:mm a")
}

export function getParticipantAuditHref(
  participantId: string,
  record?: ParticipantConsentRecord | null,
 ) {
  if (!record) {
    return null
  }

  return `/participants/${participantId}/audit?envelopeId=${encodeURIComponent(record.envelopeId)}`
}
