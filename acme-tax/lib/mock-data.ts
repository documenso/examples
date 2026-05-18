export type ClientStatus = "not_sent" | "pending" | "signed"

export interface TaxClient {
  id: string
  name: string
  email: string
  filingStatus: string
  income: number
  refundAmount: number
  status: ClientStatus
  preparerName: string
}

export const clients: TaxClient[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    filingStatus: "Married Filing Jointly",
    income: 142800,
    refundAmount: 4287,
    status: "not_sent",
    preparerName: "Robert Martinez, CPA",
  },
  {
    id: "2",
    name: "Michael Torres",
    email: "michael.torres@email.com",
    filingStatus: "Single",
    income: 87500,
    refundAmount: 1832,
    status: "signed",
    preparerName: "Robert Martinez, CPA",
  },
  {
    id: "3",
    name: "Jennifer Walsh",
    email: "jennifer.walsh@email.com",
    filingStatus: "Head of Household",
    income: 95200,
    refundAmount: -892,
    status: "not_sent",
    preparerName: "Robert Martinez, CPA",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@email.com",
    filingStatus: "Married Filing Jointly",
    income: 198400,
    refundAmount: 6145,
    status: "pending",
    preparerName: "Robert Martinez, CPA",
  },
  {
    id: "5",
    name: "Amanda Brooks",
    email: "amanda.brooks@email.com",
    filingStatus: "Single",
    income: 72300,
    refundAmount: 2103,
    status: "not_sent",
    preparerName: "Robert Martinez, CPA",
  },
]

export function getClient(id: string): TaxClient | undefined {
  return clients.find((c) => c.id === id)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}
