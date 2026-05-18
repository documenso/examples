export type MatterType =
  | "Business Formation"
  | "Contract Dispute"
  | "IP Protection"
  | "Employment Law"
  | "Real Estate"

export type MatterStatus = "Active" | "Pending"

export interface Matter {
  id: string
  clientName: string
  matterType: MatterType
  status: MatterStatus
  retainerAmount: number
}

export const RETAINER_AMOUNTS: Record<MatterType, number> = {
  "Business Formation": 5000,
  "Contract Dispute": 7500,
  "IP Protection": 10000,
  "Employment Law": 5000,
  "Real Estate": 3500,
}

export const MATTER_TYPES: MatterType[] = [
  "Business Formation",
  "Contract Dispute",
  "IP Protection",
  "Employment Law",
  "Real Estate",
]

export const matters: Matter[] = [
  {
    id: "matter-001",
    clientName: "Thompson LLC",
    matterType: "Business Formation",
    status: "Active",
    retainerAmount: 5000,
  },
  {
    id: "matter-002",
    clientName: "Garcia v. Smith",
    matterType: "Contract Dispute",
    status: "Active",
    retainerAmount: 7500,
  },
  {
    id: "matter-003",
    clientName: "Nexus Technologies",
    matterType: "IP Protection",
    status: "Pending",
    retainerAmount: 10000,
  },
  {
    id: "matter-004",
    clientName: "Riverside Properties",
    matterType: "Real Estate",
    status: "Active",
    retainerAmount: 3500,
  },
]
