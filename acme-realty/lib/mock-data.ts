import { TransactionStatus } from "@prisma/client"

export interface DemoTransactionSeed {
  id: string
  property: string
  price: string
  buyerName: string
  sellerName: string
  buyerEmail: string | null
  sellerEmail: string | null
  buyerToken: string | null
  buyerSigned: boolean
  sellerToken: string | null
  sellerSigned: boolean
  documentId: number | null
  status: TransactionStatus
}

export const DEMO_TRANSACTIONS: DemoTransactionSeed[] = [
  {
    id: "txn-001",
    property: "142 Oak Lane",
    price: "$485,000",
    buyerName: "James Wilson",
    sellerName: "Patricia Moore",
    buyerEmail: null,
    sellerEmail: null,
    buyerToken: null,
    buyerSigned: false,
    sellerToken: null,
    sellerSigned: false,
    documentId: null,
    status: TransactionStatus.DRAFT,
  },
  {
    id: "txn-002",
    property: "87 Maple Court",
    price: "$325,000",
    buyerName: "Lisa Chen",
    sellerName: "Robert Garcia",
    buyerEmail: "lisa.chen@email.com",
    sellerEmail: "robert.garcia@email.com",
    buyerToken: null,
    buyerSigned: true,
    sellerToken: null,
    sellerSigned: true,
    documentId: 1002,
    status: TransactionStatus.UNDER_CONTRACT,
  },
  {
    id: "txn-003",
    property: "2105 River Road",
    price: "$675,000",
    buyerName: "Sarah Kim",
    sellerName: "Michael Torres",
    buyerEmail: "sarah.kim@email.com",
    sellerEmail: "michael.torres@email.com",
    buyerToken: null,
    buyerSigned: true,
    sellerToken: null,
    sellerSigned: true,
    documentId: 1003,
    status: TransactionStatus.CLOSED,
  },
]
