import type { TrainingModule } from "@/lib/mock-data"

export interface CertificationRecord {
  moduleId: string
  workerName: string
  certifiedDate: string
  expiryDate: string
  documentId?: number
}

export type CertificationMap = Record<string, CertificationRecord>
export const EMPTY_CERTIFICATIONS = {} as CertificationMap

const STORAGE_KEY = "acme-compliance-certifications"
const STORAGE_EVENT = "acme-compliance-certifications-updated"
let cachedSerializedValue: string | null = null
let cachedSnapshot: CertificationMap = EMPTY_CERTIFICATIONS

function parseCertificationMap(
  serializedValue: string | null,
): CertificationMap {
  if (!serializedValue) {
    return EMPTY_CERTIFICATIONS
  }

  try {
    const parsedValue = JSON.parse(serializedValue)

    if (!parsedValue || typeof parsedValue !== "object") {
      return EMPTY_CERTIFICATIONS
    }

    return parsedValue as CertificationMap
  } catch {
    return EMPTY_CERTIFICATIONS
  }
}

export function readCertificationMap(): CertificationMap {
  if (typeof window === "undefined") {
    return EMPTY_CERTIFICATIONS
  }

  const serializedValue = window.localStorage.getItem(STORAGE_KEY)

  if (serializedValue === cachedSerializedValue) {
    return cachedSnapshot
  }

  cachedSerializedValue = serializedValue
  cachedSnapshot = parseCertificationMap(serializedValue)

  return cachedSnapshot
}

export function saveCertification(record: CertificationRecord) {
  if (typeof window === "undefined") {
    return
  }

  const currentValue = readCertificationMap()
  const nextValue = {
    ...currentValue,
    [record.moduleId]: record,
  }

  cachedSnapshot = nextValue
  cachedSerializedValue = JSON.stringify(nextValue)

  window.localStorage.setItem(STORAGE_KEY, cachedSerializedValue)
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

export function subscribeToCertificationChanges(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onChange()
    }
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(STORAGE_EVENT, onChange)

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(STORAGE_EVENT, onChange)
  }
}

export function mergeModuleWithCertification(
  module: TrainingModule,
  certification?: CertificationRecord,
): TrainingModule {
  if (!certification) {
    return module
  }

  return {
    ...module,
    status: "certified",
    certifiedDate: certification.certifiedDate,
    expiryDate: certification.expiryDate,
  }
}
