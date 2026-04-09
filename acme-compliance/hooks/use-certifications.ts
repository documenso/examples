"use client"

import { useSyncExternalStore } from "react"
import {
  EMPTY_CERTIFICATIONS,
  type CertificationMap,
  readCertificationMap,
  subscribeToCertificationChanges,
} from "@/lib/certification-store"

function readServerCertificationMap(): CertificationMap {
  return EMPTY_CERTIFICATIONS
}

export function useCertifications(): CertificationMap {
  return useSyncExternalStore(
    subscribeToCertificationChanges,
    readCertificationMap,
    readServerCertificationMap,
  )
}
