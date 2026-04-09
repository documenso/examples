import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { documenso } from "@/lib/documenso"

interface CreateTransactionBody {
  propertyAddress: string
  price: string
  buyerName: string
  buyerEmail: string
  sellerName: string
  sellerEmail: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateTransactionBody

    if (!body.buyerEmail || !body.sellerEmail) {
      return NextResponse.json(
        { error: "Buyer and seller emails are required" },
        { status: 400 },
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

    // Create document from template with 2 recipients (buyer + seller)
    const result =
      await documenso.templates.createDocumentFromTemplate({
        templateId,
        recipients: [
          { id: 1, email: body.buyerEmail, name: body.buyerName },
          { id: 2, email: body.sellerEmail, name: body.sellerName },
        ],
      })

    // Fetch the document to get signing tokens for both recipients
    const doc = await documenso.documents.getDocument({
      documentId: result.documentId,
    })

    const buyerRecipient = doc.recipients?.find(
      (r: { email: string; signingToken?: string }) => r.email === body.buyerEmail,
    )
    const sellerRecipient = doc.recipients?.find(
      (r: { email: string; signingToken?: string }) => r.email === body.sellerEmail,
    )

    if (!buyerRecipient?.signingToken || !sellerRecipient?.signingToken) {
      return NextResponse.json(
        { error: "Failed to get signing tokens for recipients" },
        { status: 500 },
      )
    }

    const transaction = await db.transaction.create({
      data: {
        property: body.propertyAddress,
        price: body.price,
        buyerName: body.buyerName,
        buyerEmail: body.buyerEmail,
        sellerName: body.sellerName,
        sellerEmail: body.sellerEmail,
        buyerToken: buyerRecipient.signingToken,
        sellerToken: sellerRecipient.signingToken,
        documentId: String(result.documentId),
      },
    })

    return NextResponse.json({ id: transaction.id })
  } catch (error) {
    console.error("Failed to create transaction:", error)
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    )
  }
}
