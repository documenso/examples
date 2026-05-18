import { PrismaClient } from "@prisma/client"
import {
  calculateFee,
  formatAumCurrency,
  getMockClient,
} from "../lib/mock-clients"

const prisma = new PrismaClient()

function createDemoEmail(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "")}@example.com`
}

async function main() {
  await prisma.clientSession.deleteMany()

  const activeProspectIds = ["david-chen", "susan-kim"]

  for (const prospectId of activeProspectIds) {
    const prospect = getMockClient(prospectId)

    if (!prospect) {
      continue
    }

    await prisma.clientSession.create({
      data: {
        prospectId: prospect.id,
        clientName: prospect.name,
        email: createDemoEmail(prospect.name),
        aum: formatAumCurrency(prospect.aum),
        fee: calculateFee(prospect.aum),
        pipelineStage: "active",
        imaSigned: true,
        feeSigned: true,
        advSigned: true,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error("Failed to seed advisory demo data:", error)
    await prisma.$disconnect()
    process.exit(1)
  })
