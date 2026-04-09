export type UnitStatus = "occupied" | "vacant" | "lease-pending" | "leased"

export interface Unit {
  id: string
  unit: string
  bedrooms: number
  bathrooms: number
  sqft: number
  rent: number
  status: UnitStatus
  amenities: string[]
  securityDeposit: number
  petDeposit?: number
  term: number
  petFriendly: boolean
  parkingSpot?: string
  pendingTenantName?: string
  leaseStartDate?: string
  leaseEndDate?: string
}

export const units: Unit[] = [
  {
    id: "2a",
    unit: "2A",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 720,
    rent: 1450,
    status: "occupied",
    amenities: ["Central AC", "In-unit W/D"],
    securityDeposit: 1450,
    term: 12,
    petFriendly: false,
  },
  {
    id: "3c",
    unit: "3C",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1080,
    rent: 2100,
    status: "occupied",
    amenities: ["Central AC", "Balcony", "In-unit W/D"],
    securityDeposit: 2100,
    petDeposit: 300,
    term: 12,
    petFriendly: true,
  },
  {
    id: "4b",
    unit: "4B",
    bedrooms: 2,
    bathrooms: 1,
    sqft: 950,
    rent: 1850,
    status: "lease-pending",
    amenities: ["In-unit W/D", "Balcony", "Central AC", "Parking spot #42"],
    securityDeposit: 1850,
    petDeposit: 350,
    term: 12,
    petFriendly: true,
    parkingSpot: "#42",
    pendingTenantName: "Jordan Lee",
    leaseStartDate: "2026-06-01",
    leaseEndDate: "2027-05-31",
  },
  {
    id: "5a",
    unit: "5A",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1350,
    rent: 2600,
    status: "occupied",
    amenities: ["Central AC", "Balcony", "In-unit W/D", "Parking spot #18"],
    securityDeposit: 2600,
    petDeposit: 400,
    term: 12,
    petFriendly: true,
    parkingSpot: "#18",
  },
  {
    id: "6d",
    unit: "6D",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 680,
    rent: 1350,
    status: "vacant",
    amenities: ["Central AC"],
    securityDeposit: 1350,
    term: 12,
    petFriendly: false,
  },
  {
    id: "7b",
    unit: "7B",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1020,
    rent: 2200,
    status: "vacant",
    amenities: ["Central AC", "In-unit W/D", "Balcony"],
    securityDeposit: 2200,
    petDeposit: 325,
    term: 12,
    petFriendly: true,
  },
]

export function getUnit(id: string): Unit | undefined {
  return units.find((unit) => unit.id === id.toLowerCase())
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatLeaseDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`))
}

export function getStatusLabel(status: UnitStatus): string {
  const labels: Record<UnitStatus, string> = {
    occupied: "Occupied",
    vacant: "Vacant",
    "lease-pending": "Lease Pending",
    leased: "Leased",
  }

  return labels[status]
}

export function getStatusColor(status: UnitStatus): string {
  const colors: Record<UnitStatus, string> = {
    occupied: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    vacant: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    "lease-pending": "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    leased: "bg-primary/10 text-primary",
  }

  return colors[status]
}
