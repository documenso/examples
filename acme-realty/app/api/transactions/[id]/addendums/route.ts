import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { AddendumStatus } from "@prisma/client"
import { db } from "@/lib/db"
import { documenso } from "@/lib/documenso"
import { getDemoTransaction } from "@/lib/transactions"

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

type DocumentRecipient = {
  id: number
  role: string
  name: string
  email: string
  token: string | null
  signedAt: string | Date | null
  sendStatus: "NOT_SENT" | "SENT"
  signingOrder?: number | null
}

function matchesRecipient(
  recipient: Pick<DocumentRecipient, "name" | "email">,
  expectedName: string,
  expectedEmail?: string | null,
) {
  if (expectedEmail) {
    return normalizeText(recipient.email) === normalizeText(expectedEmail)
  }

  return normalizeText(recipient.name) === normalizeText(expectedName)
}

function getExpectedPartyLabel(name: string, email?: string | null) {
  return email ?? name
}

function createRecipientValidationResponse(
  message: string,
  signerRecipients: DocumentRecipient[],
  transaction: Awaited<ReturnType<typeof getDemoTransaction>>,
  status = 400,
) {
  return NextResponse.json(
    {
      error: message,
      recipientValidation: {
        expected: {
          buyer: {
            name: transaction?.buyerName ?? "",
            email: transaction?.buyerEmail ?? null,
          },
          seller: {
            name: transaction?.sellerName ?? "",
            email: transaction?.sellerEmail ?? null,
          },
        },
        actualSigners: signerRecipients.map((recipient) => ({
          name: recipient.name,
          email: recipient.email,
          sendStatus: recipient.sendStatus,
          signingOrder: recipient.signingOrder ?? null,
        })),
      },
    },
    { status },
  )
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const body = (await request.json()) as { envelopeId?: string | number }

    if (!body.envelopeId) {
      return NextResponse.json(
        { error: "Envelope ID is required" },
        { status: 400 },
      )
    }

    const transaction = await getDemoTransaction(id)

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      )
    }

    const envelope = await documenso.envelopes.get({
      envelopeId: String(body.envelopeId),
    })

    const signerRecipients = [...envelope.recipients]
      .filter((recipient) => recipient.role === "SIGNER")
      .sort(
        (left, right) =>
          (left.signingOrder ?? Number.MAX_SAFE_INTEGER) -
          (right.signingOrder ?? Number.MAX_SAFE_INTEGER),
      ) as DocumentRecipient[]

    if (signerRecipients.length !== 2) {
      return createRecipientValidationResponse(
        signerRecipients.length < 2
          ? "Addendum must include exactly two signer recipients: buyer and seller."
          : "Addendum only supports two signer recipients. Move any extra parties to a non-signer role.",
        signerRecipients,
        transaction,
      )
    }

    const buyerRecipient = signerRecipients.find((recipient) =>
      matchesRecipient(
        recipient,
        transaction.buyerName,
        transaction.buyerEmail ?? undefined,
      ),
    )

    const sellerRecipient = signerRecipients.find((recipient) =>
      matchesRecipient(
        recipient,
        transaction.sellerName,
        transaction.sellerEmail ?? undefined,
      ),
    )

    if (!buyerRecipient || !sellerRecipient) {
      const expectedBuyer = getExpectedPartyLabel(
        transaction.buyerName,
        transaction.buyerEmail,
      )
      const expectedSeller = getExpectedPartyLabel(
        transaction.sellerName,
        transaction.sellerEmail,
      )

      return createRecipientValidationResponse(
        transaction.buyerEmail && transaction.sellerEmail
          ? `Signer recipients must use buyer email ${expectedBuyer} and seller email ${expectedSeller}.`
          : `Signer recipients must match buyer ${expectedBuyer} and seller ${expectedSeller}.`,
        signerRecipients,
        transaction,
      )
    }

    let distributedRecipients: Array<{
      id: number
      role: string
      name: string
      email: string
      token: string
      signingOrder: number | null
    }>

    try {
      const distributedEnvelope = await documenso.envelopes.distribute({
        envelopeId: String(body.envelopeId),
      })

      distributedRecipients = [...distributedEnvelope.recipients]
        .filter((recipient) => recipient.role === "SIGNER")
        .sort(
          (left, right) =>
            (left.signingOrder ?? Number.MAX_SAFE_INTEGER) -
            (right.signingOrder ?? Number.MAX_SAFE_INTEGER),
        )
    } catch (error) {
      console.error("Failed to distribute addendum envelope:", error)

      return createRecipientValidationResponse(
        "Documenso could not send the addendum after creation. Make sure the draft is complete, then try again.",
        signerRecipients,
        transaction,
        409,
      )
    }

    const buyerDistributionRecipient = distributedRecipients.find((recipient) =>
      matchesRecipient(
        recipient,
        transaction.buyerName,
        transaction.buyerEmail ?? undefined,
      ),
    )

    const sellerDistributionRecipient = distributedRecipients.find((recipient) =>
      matchesRecipient(
        recipient,
        transaction.sellerName,
        transaction.sellerEmail ?? undefined,
      ),
    )

    if (
      !buyerDistributionRecipient ||
      !sellerDistributionRecipient ||
      !buyerDistributionRecipient.token ||
      !sellerDistributionRecipient.token
    ) {
      return createRecipientValidationResponse(
        "The addendum was created but Documenso did not return signer tokens after sending it.",
        signerRecipients,
        transaction,
        409,
      )
    }

    const addendum = await db.addendum.create({
      data: {
        transactionId: transaction.id,
        title: envelope.title || "Custom Addendum",
        documensoDocumentId: String(body.envelopeId),
        buyerToken: buyerDistributionRecipient.token,
        sellerToken: sellerDistributionRecipient.token,
        buyerSigned: false,
        sellerSigned: false,
        status: AddendumStatus.SENT,
      },
    })

    if (!transaction.buyerEmail || !transaction.sellerEmail) {
      await db.transaction.update({
        where: { id: transaction.id },
        data: {
          buyerEmail:
            transaction.buyerEmail ?? buyerDistributionRecipient.email,
          sellerEmail:
            transaction.sellerEmail ?? sellerDistributionRecipient.email,
        },
      })
    }

    revalidatePath("/")
    revalidatePath(`/transactions/${id}`)
    revalidatePath(`/transactions/${id}/addendum`)

    return NextResponse.json({
      addendum: {
        id: addendum.id,
        title: addendum.title,
        buyerToken: addendum.buyerToken,
        sellerToken: addendum.sellerToken,
        buyerSigned: addendum.buyerSigned,
        sellerSigned: addendum.sellerSigned,
        status: addendum.status,
      },
    })
  } catch (error) {
    console.error("Failed to create addendum:", error)
    return NextResponse.json(
      { error: "Failed to create addendum" },
      { status: 500 },
    )
  }
}
