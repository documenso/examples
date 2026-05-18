"use client"

import * as React from "react"
import {
  type ParticipantConsentRecord,
  type StoredParticipantConsents,
} from "@/lib/participant-consents"

const STORAGE_KEY = "acme-trials-consents"
const STORAGE_EVENT = "acme-trials-consents-updated"

function isConsentRecord(value: unknown): value is ParticipantConsentRecord {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.participantId === "string" &&
    typeof record.envelopeId === "string" &&
    typeof record.email === "string" &&
    typeof record.consentedAt === "string" &&
    (typeof record.documentId === "number" || record.documentId === null) &&
    (typeof record.signedAt === "string" || record.signedAt === null)
  )
}

function parseStoredConsents(value: string | null): StoredParticipantConsents {
  if (!value) {
    return {}
  }

  try {
    const parsed = JSON.parse(value)

    if (!parsed || typeof parsed !== "object") {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, ParticipantConsentRecord] =>
          isConsentRecord(entry[1]),
      ),
    )
  } catch {
    return {}
  }
}

function readStoredConsents(): StoredParticipantConsents {
  if (typeof window === "undefined") {
    return {}
  }

  return parseStoredConsents(window.localStorage.getItem(STORAGE_KEY))
}

function writeStoredConsents(consents: StoredParticipantConsents) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consents))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

export function useParticipantConsents() {
  const [records, setRecords] = React.useState<StoredParticipantConsents>({})

  React.useEffect(() => {
    const syncRecords = () => {
      setRecords(readStoredConsents())
    }

    syncRecords()
    window.addEventListener("storage", syncRecords)
    window.addEventListener(STORAGE_EVENT, syncRecords)

    return () => {
      window.removeEventListener("storage", syncRecords)
      window.removeEventListener(STORAGE_EVENT, syncRecords)
    }
  }, [])

  const upsertConsent = React.useCallback((record: ParticipantConsentRecord) => {
    const nextRecords = {
      ...readStoredConsents(),
      [record.participantId]: record,
    }

    writeStoredConsents(nextRecords)
    setRecords(nextRecords)
  }, [])

  return {
    records,
    upsertConsent,
  }
}
