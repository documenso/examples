import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()
  console.log("AcmeGig has no static seed data. Database connection verified.")
}

main()
  .catch((error) => {
    console.error("Failed to run AcmeGig seed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
