export type WaiverStatus = "not-sent" | "sent" | "signed"
export type PaymentStatus = "pending" | "released"

export interface Subcontractor {
  id: string
  name: string
  trade: string
  amount: number
  waiverStatus: WaiverStatus
  paymentStatus: PaymentStatus
}

export const PROJECT_NAME = "Riverside Office Build"
export const PROJECT_BUDGET = 1_200_000
export const PROJECT_COMPLETION_PERCENT = 62
export const PAY_PERIOD = {
  label: "March 2025",
  startDate: "03/01/2025",
  endDate: "03/31/2025",
  displayRange: "03/01/2025 – 03/31/2025",
}

export const subcontractors: Subcontractor[] = [
  {
    id: "apex-electrical",
    name: "Apex Electrical",
    trade: "Electrical",
    amount: 42000,
    waiverStatus: "not-sent",
    paymentStatus: "pending",
  },
  {
    id: "summit-plumbing",
    name: "Summit Plumbing",
    trade: "Plumbing",
    amount: 38500,
    waiverStatus: "not-sent",
    paymentStatus: "pending",
  },
  {
    id: "iron-ridge-framing",
    name: "Iron Ridge Framing",
    trade: "Framing",
    amount: 67000,
    waiverStatus: "not-sent",
    paymentStatus: "pending",
  },
  {
    id: "clearview-glass",
    name: "ClearView Glass",
    trade: "Glazing",
    amount: 28000,
    waiverStatus: "not-sent",
    paymentStatus: "pending",
  },
  {
    id: "pacific-concrete",
    name: "Pacific Concrete",
    trade: "Concrete",
    amount: 95000,
    waiverStatus: "not-sent",
    paymentStatus: "pending",
  },
]

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getSubcontractor(subId: string) {
  return subcontractors.find((subcontractor) => subcontractor.id === subId)
}
