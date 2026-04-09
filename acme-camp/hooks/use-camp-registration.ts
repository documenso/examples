"use client"

import { useMemo, useSyncExternalStore } from "react"

const CAMP_REGISTRATION_KEY = "camp-registration"
const PENDING = Symbol("pending")
type CampRegistrationSnapshot = string | null | typeof PENDING

export interface CampRegistration {
  childName: string
  childAge: string
  parentName: string
  email: string
  phone: string
  emergencyName: string
  emergencyPhone: string
  medical: string
  sessionId: string
  sessionDates: string
  price: number
}

function parseCampRegistration(raw: string | null): CampRegistration | null {
  if (!raw) return null

  try {
    return JSON.parse(raw) as CampRegistration
  } catch {
    return null
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  return () => window.removeEventListener("storage", onStoreChange)
}

function getSnapshot(): CampRegistrationSnapshot {
  return sessionStorage.getItem(CAMP_REGISTRATION_KEY)
}

function getServerSnapshot(): CampRegistrationSnapshot {
  return PENDING
}

export function useCampRegistration() {
  const rawRegistration = useSyncExternalStore<CampRegistrationSnapshot>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )
  const registration = useMemo(
    () =>
      rawRegistration === PENDING
        ? null
        : parseCampRegistration(rawRegistration),
    [rawRegistration],
  )
  const isReady = rawRegistration !== PENDING

  return { registration, isReady }
}
