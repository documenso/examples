import type { SessionStatus } from "@/lib/mock-data"

const STORAGE_KEY = "acme-notary-session-state"
const STORAGE_EVENT = "acme-notary-session-state"

export type StoredSessionState = {
  status?: SessionStatus
  documentId?: number
  envelopeId?: string
  preparedAt?: string
  completedAt?: string
}

type SessionStateMap = Record<string, StoredSessionState>
const EMPTY_SESSION_STATE: SessionStateMap = {}

let cachedRawState: string | null | undefined
let cachedSessionState: SessionStateMap = EMPTY_SESSION_STATE

function readSessionState(): SessionStateMap {
  if (typeof window === "undefined") {
    return EMPTY_SESSION_STATE
  }

  const rawState = window.localStorage.getItem(STORAGE_KEY)

  if (rawState === cachedRawState) {
    return cachedSessionState
  }

  cachedRawState = rawState

  if (!rawState) {
    cachedSessionState = EMPTY_SESSION_STATE
    return cachedSessionState
  }

  try {
    cachedSessionState = JSON.parse(rawState) as SessionStateMap
  } catch {
    cachedSessionState = EMPTY_SESSION_STATE
  }

  return cachedSessionState
}

function writeSessionState(state: SessionStateMap) {
  if (typeof window === "undefined") {
    return
  }

  const rawState = JSON.stringify(state)

  cachedRawState = rawState
  cachedSessionState = state

  window.localStorage.setItem(STORAGE_KEY, rawState)
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

export function getAllStoredSessionStates() {
  return readSessionState()
}

export function getServerSessionStates() {
  return EMPTY_SESSION_STATE
}

export function getStoredSessionState(sessionId: string) {
  return getAllStoredSessionStates()[sessionId]
}

export function updateStoredSessionState(
  sessionId: string,
  state: Partial<StoredSessionState>
) {
  const currentState = readSessionState()
  const nextSessionState = {
    ...currentState[sessionId],
    ...state,
  }

  writeSessionState({
    ...currentState,
    [sessionId]: nextSessionState,
  })
}

export function subscribeToSessionState(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const handleStorage = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key &&
      event.key !== STORAGE_KEY
    ) {
      return
    }

    callback()
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(STORAGE_EVENT, handleStorage)

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(STORAGE_EVENT, handleStorage)
  }
}
