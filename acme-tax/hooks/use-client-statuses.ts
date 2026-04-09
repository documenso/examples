"use client"

import * as React from "react"

import type { ClientStatus } from "@/lib/mock-data"

const STORAGE_KEY = "acme-tax-client-statuses"
const STORAGE_EVENT = "acme-tax-client-statuses-updated"

type StoredClientStatuses = Partial<Record<string, ClientStatus>>

function isClientStatus(value: unknown): value is ClientStatus {
  return value === "not_sent" || value === "pending" || value === "signed"
}

function parseStoredStatuses(value: string | null): StoredClientStatuses {
  if (!value) {
    return {}
  }

  try {
    const parsed = JSON.parse(value)

    if (!parsed || typeof parsed !== "object") {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, ClientStatus] =>
        isClientStatus(entry[1]),
      ),
    )
  } catch {
    return {}
  }
}

function readStoredStatuses(): StoredClientStatuses {
  if (typeof window === "undefined") {
    return {}
  }

  return parseStoredStatuses(window.localStorage.getItem(STORAGE_KEY))
}

function writeStoredStatuses(statuses: StoredClientStatuses) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

export function useClientStatuses() {
  const [statuses, setStatuses] = React.useState<StoredClientStatuses>({})

  React.useEffect(() => {
    const syncStatuses = () => {
      setStatuses(readStoredStatuses())
    }

    syncStatuses()
    window.addEventListener("storage", syncStatuses)
    window.addEventListener(STORAGE_EVENT, syncStatuses)

    return () => {
      window.removeEventListener("storage", syncStatuses)
      window.removeEventListener(STORAGE_EVENT, syncStatuses)
    }
  }, [])

  const updateClientStatus = React.useCallback(
    (clientId: string, status: ClientStatus) => {
      const nextStatuses = {
        ...readStoredStatuses(),
        [clientId]: status,
      }

      writeStoredStatuses(nextStatuses)
      setStatuses(nextStatuses)
    },
    [],
  )

  return {
    statuses,
    updateClientStatus,
  }
}
