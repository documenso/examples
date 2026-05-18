import type { PaymentStatus, WaiverStatus } from "@/lib/mock-data"

export type StoredWaiverSession = {
  documentId: number
  signingToken: string
  signerEmail: string
  waiverStatus: Exclude<WaiverStatus, "not-sent">
  paymentStatus: PaymentStatus
  completedAt?: string
}

const WAIVER_SESSION_PREFIX = "waiver-session-"

export function getWaiverSessionStorageKey(subId: string) {
  return `${WAIVER_SESSION_PREFIX}${subId}`
}

export function readWaiverSession(subId: string): StoredWaiverSession | null {
  if (typeof window === "undefined") {
    return null
  }

  const rawValue = window.sessionStorage.getItem(
    getWaiverSessionStorageKey(subId)
  )

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as StoredWaiverSession
  } catch {
    window.sessionStorage.removeItem(getWaiverSessionStorageKey(subId))
    return null
  }
}

export function writeWaiverSession(
  subId: string,
  session: StoredWaiverSession
) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(
    getWaiverSessionStorageKey(subId),
    JSON.stringify(session)
  )
}
