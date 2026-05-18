"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { type Unit, units as initialUnits } from "@/lib/mock-data"

export interface CompletedLeasePacket {
  unitId: string
  tenantName: string
  tenantEmail: string
  leaseDocumentId: number
  petAddendumDocumentId?: number
  completedAt: string
}

interface LeasingSessionContextValue {
  units: Unit[]
  completedPackets: Record<string, CompletedLeasePacket>
  getUnitById: (id: string) => Unit | undefined
  markUnitLeased: (
    unitId: string,
    packet: Omit<CompletedLeasePacket, "unitId" | "completedAt"> & {
      completedAt?: string
    },
  ) => void
}

const LeasingSessionContext = createContext<LeasingSessionContextValue | null>(null)

export function LeasingSessionProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState(initialUnits)
  const [completedPackets, setCompletedPackets] = useState<
    Record<string, CompletedLeasePacket>
  >({})

  const getUnitById = useCallback(
    (id: string) => units.find((unit) => unit.id === id.toLowerCase()),
    [units],
  )

  const markUnitLeased = useCallback<LeasingSessionContextValue["markUnitLeased"]>(
    (unitId, packet) => {
      const normalizedUnitId = unitId.toLowerCase()

      setUnits((currentUnits) =>
        currentUnits.map((unit) =>
          unit.id === normalizedUnitId ? { ...unit, status: "leased" } : unit,
        ),
      )

      setCompletedPackets((currentPackets) => ({
        ...currentPackets,
        [normalizedUnitId]: {
          ...packet,
          unitId: normalizedUnitId,
          completedAt: packet.completedAt ?? new Date().toISOString(),
        },
      }))
    },
    [],
  )

  const value = useMemo(
    () => ({
      units,
      completedPackets,
      getUnitById,
      markUnitLeased,
    }),
    [completedPackets, getUnitById, markUnitLeased, units],
  )

  return (
    <LeasingSessionContext.Provider value={value}>
      {children}
    </LeasingSessionContext.Provider>
  )
}

export function useLeasingSession() {
  const context = useContext(LeasingSessionContext)

  if (!context) {
    throw new Error("useLeasingSession must be used within LeasingSessionProvider")
  }

  return context
}
