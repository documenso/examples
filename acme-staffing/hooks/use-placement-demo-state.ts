"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  placements as defaultPlacements,
  type Placement,
} from "@/lib/mock-data"

export type DocStatus = "pending" | "signing" | "completed"

export type OnboardingData = {
  email: string
  candidateName: string
  clientCompany: string
  role: string
  startDate: string
  hourlyRate: number
}

type StoredOnboardingState = {
  data: OnboardingData
  docStatuses: Record<"contractor" | "background", DocStatus>
}

const STORAGE_RESET_MARKER_ID = "acme-staffing-storage-reset-2026-04-08"
const PLACEMENTS_STORAGE_ID = "acme-staffing-placements"
const ONBOARDING_STORAGE_ID_PREFIX = "acme-staffing-onboarding"

const DEFAULT_DOC_STATUSES: Record<"contractor" | "background", DocStatus> = {
  contractor: "pending",
  background: "pending",
}

function canUseStorage() {
  return typeof window !== "undefined"
}

function ensureStorageReset() {
  if (!canUseStorage()) {
    return
  }

  if (window.localStorage.getItem(STORAGE_RESET_MARKER_ID) === "done") {
    return
  }

  window.localStorage.removeItem(PLACEMENTS_STORAGE_ID)

  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith(ONBOARDING_STORAGE_ID_PREFIX)) {
      window.localStorage.removeItem(key)
    }
  }

  window.localStorage.setItem(STORAGE_RESET_MARKER_ID, "done")
}

function parseJSON<T>(value: string | null): T | null {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function getOnboardingStorageKey(placementId: string) {
  return `${ONBOARDING_STORAGE_ID_PREFIX}-${placementId}`
}

function mergePlacements(storedPlacements: Placement[] | null) {
  if (!storedPlacements?.length) {
    return defaultPlacements
  }

  const placementsById = new Map(
    storedPlacements.map((placement) => [placement.id, placement])
  )

  return defaultPlacements.map((placement) => ({
    ...placement,
    ...placementsById.get(placement.id),
    status: placementsById.get(placement.id)?.status ?? placement.status,
  }))
}

function normalizeDocStatuses(
  docStatuses?: Partial<Record<"contractor" | "background", DocStatus>>
) {
  return {
    contractor:
      docStatuses?.contractor === "completed" ? "completed" : "pending",
    background:
      docStatuses?.background === "completed" ? "completed" : "pending",
  } satisfies Record<"contractor" | "background", DocStatus>
}

export function readPlacements() {
  if (!canUseStorage()) {
    return defaultPlacements
  }

  ensureStorageReset()

  return mergePlacements(
    parseJSON<Placement[]>(window.localStorage.getItem(PLACEMENTS_STORAGE_ID))
  )
}

function persistPlacements(nextPlacements: Placement[]) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(
    PLACEMENTS_STORAGE_ID,
    JSON.stringify(nextPlacements)
  )
}

export function updatePlacementStatus(
  placementId: string,
  status: Placement["status"]
) {
  const nextPlacements = readPlacements().map((placement) =>
    placement.id === placementId ? { ...placement, status } : placement
  )

  persistPlacements(nextPlacements)

  return nextPlacements
}

export function readOnboardingState(placementId: string) {
  if (!canUseStorage()) {
    return null
  }

  ensureStorageReset()

  const storedState = parseJSON<StoredOnboardingState>(
    window.localStorage.getItem(getOnboardingStorageKey(placementId))
  )

  if (!storedState?.data) {
    return null
  }

  return {
    data: storedState.data,
    docStatuses: normalizeDocStatuses(storedState.docStatuses),
  } satisfies StoredOnboardingState
}

export function saveOnboardingState(
  placementId: string,
  data: OnboardingData,
  docStatuses: Partial<
    Record<"contractor" | "background", DocStatus>
  > = DEFAULT_DOC_STATUSES
) {
  if (!canUseStorage()) {
    return
  }

  ensureStorageReset()

  window.localStorage.setItem(
    getOnboardingStorageKey(placementId),
    JSON.stringify({
      data,
      docStatuses: normalizeDocStatuses(docStatuses),
    } satisfies StoredOnboardingState)
  )
}

export function usePlacements() {
  const [placements, setPlacements] = useState<Placement[]>(defaultPlacements)

  useEffect(() => {
    const syncPlacements = () => {
      const nextPlacements = readPlacements()
      persistPlacements(nextPlacements)
      setPlacements(nextPlacements)
    }

    syncPlacements()

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === PLACEMENTS_STORAGE_ID) {
        syncPlacements()
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const setPlacementStatus = useCallback(
    (placementId: string, status: Placement["status"]) => {
      const nextPlacements = updatePlacementStatus(placementId, status)
      setPlacements(nextPlacements)
    },
    []
  )

  return { placements, setPlacementStatus }
}

export function usePlacement(
  placementId: string,
  initialPlacement?: Placement
) {
  const { placements, setPlacementStatus } = usePlacements()

  const placement = useMemo(
    () =>
      placements.find(
        (currentPlacement) => currentPlacement.id === placementId
      ) ?? initialPlacement,
    [initialPlacement, placementId, placements]
  )

  return { placement, setPlacementStatus }
}
