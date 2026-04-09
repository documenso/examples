export type PipelineStage = "prospect" | "onboarding" | "active"

export interface MockClient {
  id: string
  name: string
  aum: number
  feePercent: number
  riskProfile: string
  investmentGoals: string
  stage: PipelineStage
  signedCount: number
  totalDocs: number
}

export const mockClients: MockClient[] = [
  {
    id: "margaret-liu",
    name: "Margaret Liu",
    aum: 2100000,
    feePercent: 0.83,
    riskProfile: "Moderate Growth",
    investmentGoals: "Retirement planning, wealth preservation, tax-efficient income",
    stage: "prospect",
    signedCount: 0,
    totalDocs: 3,
  },
  {
    id: "thomas-park",
    name: "Thomas Park",
    aum: 890000,
    feePercent: 1.0,
    riskProfile: "Aggressive Growth",
    investmentGoals: "Long-term capital appreciation, equity-heavy allocation",
    stage: "prospect",
    signedCount: 0,
    totalDocs: 3,
  },
  {
    id: "rachel-green",
    name: "Rachel Green",
    aum: 1500000,
    feePercent: 0.88,
    riskProfile: "Balanced",
    investmentGoals: "Education funding, diversified portfolio, moderate risk tolerance",
    stage: "onboarding",
    signedCount: 1,
    totalDocs: 3,
  },
  {
    id: "david-chen",
    name: "David Chen",
    aum: 3200000,
    feePercent: 0.78,
    riskProfile: "Conservative",
    investmentGoals: "Capital preservation, fixed income, estate planning",
    stage: "active",
    signedCount: 3,
    totalDocs: 3,
  },
  {
    id: "susan-kim",
    name: "Susan Kim",
    aum: 1800000,
    feePercent: 0.85,
    riskProfile: "Moderate",
    investmentGoals: "Retirement income, dividend strategy, tax-loss harvesting",
    stage: "active",
    signedCount: 3,
    totalDocs: 3,
  },
]

export function formatAum(aum: number): string {
  if (aum >= 1000000) {
    return `$${(aum / 1000000).toFixed(1)}M`
  }
  return `$${(aum / 1000).toFixed(0)}K`
}

export function calculateFee(aum: number): string {
  // 1.0% on first $1M, 0.75% over $1M
  if (aum <= 1000000) {
    return "1.00%"
  }
  const feeOnFirst = 1000000 * 0.01
  const feeOnRest = (aum - 1000000) * 0.0075
  const totalFee = feeOnFirst + feeOnRest
  const effectiveRate = (totalFee / aum) * 100
  return `${effectiveRate.toFixed(2)}%`
}

export function getMockClient(id: string): MockClient | undefined {
  return mockClients.find((c) => c.id === id)
}
