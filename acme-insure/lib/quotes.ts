export interface Quote {
  id: string
  carrier: string
  premium: number
  coverageType: string
  features: string[]
}

export const quotes: Quote[] = [
  {
    id: "safeguard",
    carrier: "SafeGuard Insurance",
    premium: 127,
    coverageType: "Full Coverage",
    features: [
      "Collision & comprehensive",
      "Liability up to $300K",
      "Uninsured motorist protection",
      "Glass repair included",
    ],
  },
  {
    id: "shield",
    carrier: "Shield Auto",
    premium: 142,
    coverageType: "Full Coverage + Roadside",
    features: [
      "Collision & comprehensive",
      "Liability up to $500K",
      "24/7 roadside assistance",
      "Rental car reimbursement",
      "New car replacement",
    ],
  },
  {
    id: "premier",
    carrier: "Premier Coverage",
    premium: 98,
    coverageType: "Basic Coverage",
    features: [
      "Liability up to $100K",
      "Collision coverage",
      "Medical payments",
    ],
  },
]

export function getQuoteById(id: string): Quote | undefined {
  return quotes.find((q) => q.id === id)
}
