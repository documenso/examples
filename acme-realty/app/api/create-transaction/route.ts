import { revalidatePath } from "next/cache"
import { TransactionStatus } from "@prisma/client"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { documenso } from "@/lib/documenso"
import { ensureDemoTransactions } from "@/lib/transactions"

interface CreateTransactionBody {
  transactionId: string
  buyerEmail: string
  sellerEmail: string
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function findPrefillField(
  fields: Array<{
    id: number
    fieldMeta:
      | {
          type?: string
          label?: string
          placeholder?: string
        }
      | null
  }>,
  candidates: string[],
) {
  return fields.find((field) => {
    const meta = field.fieldMeta

    if (!meta || (meta.type !== "text" && meta.type !== "number")) {
      return false
    }

    const haystacks = [meta.label, meta.placeholder]
      .filter(Boolean)
      .map((value) => normalizeText(value!))

    return candidates.some((candidate) =>
      haystacks.some((haystack) => haystack.includes(normalizeText(candidate))),
    )
  })
}

export async function POST(request: Request) {
  try {
    await ensureDemoTransactions()

    const body = (await request.json()) as CreateTransactionBody

    if (!body.buyerEmail || !body.sellerEmail) {
      return NextResponse.json(
        { error: "Buyer and seller emails are required" },
        { status: 400 },
      )
    }

    const transaction = await db.transaction.findUnique({
      where: { id: body.transactionId },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      )
    }

    const templateId = Number(
      process.env.DOCUMENSO_TEMPLATE_PURCHASE_AGREEMENT,
    )

    if (!templateId) {
      return NextResponse.json(
        { error: "Purchase agreement template not configured" },
        { status: 500 },
      )
    }

    const template = await documenso.templates.get({ templateId })

    const signerRecipients = [...template.recipients]
      .filter((recipient) => recipient.role === "SIGNER")
      .sort(
        (left, right) =>
          (left.signingOrder ?? Number.MAX_SAFE_INTEGER) -
          (right.signingOrder ?? Number.MAX_SAFE_INTEGER),
      )

    if (signerRecipients.length < 2) {
      return NextResponse.json(
        { error: "Purchase agreement template must have buyer and seller signers" },
        { status: 500 },
      )
    }

    const prefillFieldDefinitions = [
      {
        candidates: ["property address", "address", "property"],
        value: transaction.property,
      },
      {
        candidates: ["purchase price", "price"],
        value: transaction.price,
      },
      {
        candidates: ["buyer name", "buyer"],
        value: transaction.buyerName,
      },
      {
        candidates: ["seller name", "seller"],
        value: transaction.sellerName,
      },
    ]
      .map(({ candidates, value }) => {
        const field = findPrefillField(template.fields, candidates)

        if (
          !field?.fieldMeta ||
          (field.fieldMeta.type !== "text" && field.fieldMeta.type !== "number")
        ) {
          return null
        }

        if (field.fieldMeta.type === "number") {
          return {
            id: field.id,
            type: "number" as const,
            label: field.fieldMeta.label,
            placeholder: field.fieldMeta.placeholder,
            value,
          }
        }

        return {
          id: field.id,
          type: "text" as const,
          label: field.fieldMeta.label,
          placeholder: field.fieldMeta.placeholder,
          value,
        }
      })
      .filter((field): field is NonNullable<typeof field> => field !== null)

    const document = await documenso.templates.use({
      templateId,
      recipients: [
        {
          id: signerRecipients[0].id,
          email: body.buyerEmail,
          name: transaction.buyerName,
        },
        {
          id: signerRecipients[1].id,
          email: body.sellerEmail,
          name: transaction.sellerName,
        },
      ],
      distributeDocument: true,
      prefillFields: prefillFieldDefinitions,
    })

    const buyerRecipient = document.recipients.find(
      (recipient) => normalizeText(recipient.email) === normalizeText(body.buyerEmail),
    )
    const sellerRecipient = document.recipients.find(
      (recipient) =>
        normalizeText(recipient.email) === normalizeText(body.sellerEmail),
    )

    if (!buyerRecipient?.token || !sellerRecipient?.token) {
      return NextResponse.json(
        { error: "Failed to get signing tokens for recipients" },
        { status: 500 },
      )
    }

    await db.transaction.update({
      where: { id: transaction.id },
      data: {
        buyerEmail: body.buyerEmail,
        sellerEmail: body.sellerEmail,
        buyerToken: buyerRecipient.token,
        sellerToken: sellerRecipient.token,
        buyerSigned: false,
        sellerSigned: false,
        documentId: document.id,
        status: TransactionStatus.DRAFT,
      },
    })

    revalidatePath("/")
    revalidatePath(`/transactions/${transaction.id}`)
    revalidatePath(`/transactions/${transaction.id}/sign`)

    return NextResponse.json({ id: transaction.id })
  } catch (error) {
    console.error("Failed to create transaction:", error)
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    )
  }
}
