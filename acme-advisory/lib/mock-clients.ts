export const FIRM_NAME = "Meridian Wealth Advisors"
export const TOTAL_ONBOARDING_DOCS = 3

export interface MockClient {
  id: string
  name: string
  aum: number
  riskProfile: string
  investmentGoals: string
}

export const mockClients: MockClient[] = [
  {
    id: "margaret-liu",
    name: "Margaret Liu",
    aum: 2100000,
    riskProfile: "Moderate Growth",
    investmentGoals:
      "Retirement planning, wealth preservation, tax-efficient income",
  },
  {
    id: "thomas-park",
    name: "Thomas Park",
    aum: 890000,
    riskProfile: "Aggressive Growth",
    investmentGoals:
      "Long-term capital appreciation, equity-heavy allocation",
  },
  {
    id: "rachel-green",
    name: "Rachel Green",
    aum: 1500000,
    riskProfile: "Balanced",
    investmentGoals:
      "Education funding, diversified portfolio, moderate risk tolerance",
  },
  {
    id: "david-chen",
    name: "David Chen",
    aum: 3200000,
    riskProfile: "Conservative",
    investmentGoals: "Capital preservation, fixed income, estate planning",
  },
  {
    id: "susan-kim",
    name: "Susan Kim",
    aum: 1800000,
    riskProfile: "Moderate",
    investmentGoals:
      "Retirement income, dividend strategy, tax-loss harvesting",
  },
]

export function formatAum(aum: number): string {
  if (aum >= 1000000) {
    return `$${(aum / 1000000).toFixed(1)}M`
  }

  return `$${(aum / 1000).toFixed(0)}K`
}

export function calculateAnnualFee(aum: number): number {
  if (aum <= 1000000) {
    return aum * 0.01
  }

  return 1000000 * 0.01 + (aum - 1000000) * 0.0075
}

export function calculateFee(aum: number): string {
  const annualFee = calculateAnnualFee(aum)
  const effectiveRate = (annualFee / aum) * 100

  return `${effectiveRate.toFixed(2)}%`
}

const fullCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export function formatAumCurrency(aum: number): string {
  return fullCurrencyFormatter.format(aum)
}

export function formatAnnualFee(amount: number): string {
  return fullCurrencyFormatter.format(amount)
}

export function getMockClient(id: string): MockClient | undefined {
  return mockClients.find((client) => client.id === id)
}
