import { Prisma, TransactionStatus } from "@prisma/client"
import { db } from "@/lib/db"
import { DEMO_TRANSACTIONS } from "@/lib/mock-data"

export const DEMO_TRANSACTION_IDS = DEMO_TRANSACTIONS.map(
  (transaction) => transaction.id,
)

export type TransactionWithAddendums = Prisma.TransactionGetPayload<{
  include: { addendums: true }
}>

export async function ensureDemoTransactions() {
  await Promise.all(
    DEMO_TRANSACTIONS.map((transaction) =>
      db.transaction.upsert({
        where: { id: transaction.id },
        update: {},
        create: transaction,
      }),
    ),
  )
}

export async function listDemoTransactions() {
  await ensureDemoTransactions()

  const transactions = await db.transaction.findMany({
    where: { id: { in: DEMO_TRANSACTION_IDS } },
    include: {
      addendums: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  const order = new Map(
    DEMO_TRANSACTION_IDS.map((transactionId, index) => [transactionId, index]),
  )

  return transactions.sort(
    (left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0),
  )
}

export async function getDemoTransaction(id: string) {
  if (!DEMO_TRANSACTION_IDS.includes(id)) {
    return null
  }

  await ensureDemoTransactions()

  return db.transaction.findUnique({
    where: { id },
    include: {
      addendums: {
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export function getTransactionStatusLabel(status: TransactionStatus) {
  switch (status) {
    case TransactionStatus.UNDER_CONTRACT:
      return "Under Contract"
    case TransactionStatus.CLOSED:
      return "Closed"
    case TransactionStatus.DRAFT:
    default:
      return "Draft"
  }
}
