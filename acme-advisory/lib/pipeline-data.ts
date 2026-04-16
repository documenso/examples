import { cache } from "react"
import { type ClientSession } from "@prisma/client"
import { db } from "@/lib/db"
import {
  TOTAL_ONBOARDING_DOCS,
  calculateAnnualFee,
  calculateFee,
  formatAum,
  getMockClient,
  mockClients,
  type MockClient,
} from "@/lib/mock-clients"

export type PipelineStage = "prospect" | "onboarding" | "active"

export type PipelineCard = {
  prospectId: string
  href: string
  name: string
  aumLabel: string
  feeLabel: string
  riskProfile: string
  stage: PipelineStage
  signedCount: number
  totalDocs: number
  email: string | null
  sessionId: string | null
}

export type ProspectDetailData = {
  prospect: MockClient
  session: ClientSession | null
  stage: PipelineStage
  signedCount: number
  totalDocs: number
  aumLabel: string
  feeLabel: string
  annualFee: number
}

export function getSignedCount(
  session: Pick<ClientSession, "imaSigned" | "feeSigned" | "advSigned">
): number {
  return [session.imaSigned, session.feeSigned, session.advSigned].filter(Boolean)
    .length
}

function resolveStage(session: ClientSession | null): PipelineStage {
  if (!session) {
    return "prospect"
  }

  return session.pipelineStage === "active" ? "active" : "onboarding"
}

function buildPipelineCard(
  prospect: MockClient,
  session: ClientSession | null
): PipelineCard {
  const stage = resolveStage(session)

  return {
    prospectId: prospect.id,
    href: `/clients/${prospect.id}`,
    name: prospect.name,
    aumLabel: session?.aum || formatAum(prospect.aum),
    feeLabel: session?.fee || calculateFee(prospect.aum),
    riskProfile: prospect.riskProfile,
    stage,
    signedCount: session ? getSignedCount(session) : 0,
    totalDocs: TOTAL_ONBOARDING_DOCS,
    email: session?.email ?? null,
    sessionId: session?.id ?? null,
  }
}

export const getSessionById = cache(async (id: string) => {
  return db.clientSession.findUnique({
    where: { id },
  })
})

export const getSessionByProspectId = cache(async (prospectId: string) => {
  return db.clientSession.findUnique({
    where: { prospectId },
  })
})

export const getPipelineCards = cache(async (): Promise<PipelineCard[]> => {
  const sessions = await db.clientSession.findMany({
    where: {
      prospectId: {
        in: mockClients.map((client) => client.id),
      },
    },
  })

  const sessionsByProspectId = new Map(
    sessions.map((session) => [session.prospectId, session])
  )

  return mockClients.map((prospect) =>
    buildPipelineCard(prospect, sessionsByProspectId.get(prospect.id) ?? null)
  )
})

export async function getProspectDetailData(
  prospectId: string
): Promise<ProspectDetailData | null> {
  const prospect = getMockClient(prospectId)

  if (!prospect) {
    return null
  }

  const session = await getSessionByProspectId(prospectId)

  return {
    prospect,
    session,
    stage: resolveStage(session),
    signedCount: session ? getSignedCount(session) : 0,
    totalDocs: TOTAL_ONBOARDING_DOCS,
    aumLabel: session?.aum || formatAum(prospect.aum),
    feeLabel: session?.fee || calculateFee(prospect.aum),
    annualFee: calculateAnnualFee(prospect.aum),
  }
}
