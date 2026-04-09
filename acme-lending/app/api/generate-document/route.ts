import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"
import { buildLoanAgreementPrefill } from "@/lib/loan-agreement-prefill"
import { getLoanOffer } from "@/lib/loan-offer"

function formatLoanPurpose(value: string) {
  if (!value) return ""

  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const borrowerName = String(body.borrowerName ?? "").trim()
    const businessName = String(body.businessName ?? "").trim()
    const email = String(body.email ?? "").trim()
    const loanPurpose = String(body.loanPurpose ?? "").trim()
    const requestedLoanAmount = Number(body.loanAmount)
    const templateId = Number(process.env.DOCUMENSO_TEMPLATE_ID)

    if (!borrowerName || !businessName || !email) {
      return NextResponse.json(
        { error: "borrowerName, businessName, and email are required" },
        { status: 400 },
      )
    }

    if (!templateId) {
      return NextResponse.json(
        { error: "Documenso template ID not configured" },
        { status: 500 },
      )
    }

    const template = await documenso.templates.get({ templateId })
    const offer = getLoanOffer(
      Number.isFinite(requestedLoanAmount) && requestedLoanAmount > 0
        ? requestedLoanAmount
        : undefined,
    )
    const prefillValues = buildLoanAgreementPrefill(template.fields, {
      borrowerName,
      businessName: "",
      loanAmount: String(offer.amount),
      apr: String(offer.apr),
      term: `${offer.termMonths} months`,
      monthlyPayment: offer.monthlyPayment.toFixed(2),
      loanPurpose: formatLoanPurpose(loanPurpose),
    })

    const recipients = template.recipients.map((r) => ({
      id: r.id,
      name: borrowerName,
      email,
      signingOrder: r.signingOrder,
      role: r.role,
    }))

    const document = await documenso.templates.use({
      templateId,
      recipients,
      distributeDocument: false,
      prefillFields: prefillValues.prefillFields,
      formValues: prefillValues.formValues,
    })

    const primaryRecipient = document.recipients?.[0]

    if (!primaryRecipient) {
      return NextResponse.json(
        { error: "No recipient returned from Documenso" },
        { status: 500 },
      )
    }

    await documenso.documents.recipients.updateMany({
      documentId: document.id,
      recipients: [
        {
          id: primaryRecipient.id,
          name: borrowerName,
          email,
        },
      ],
    })

    await documenso.documents.distribute({
      documentId: document.id,
    })

    const refreshedDocument = await documenso.documents.get({
      documentId: document.id,
    })
    const signingToken = refreshedDocument.recipients?.[0]?.token

    if (!signingToken) {
      return NextResponse.json(
        { error: "No signing token received from Documenso" },
        { status: 500 },
      )
    }

    return NextResponse.json({ signingToken, documentId: document.id })
  } catch (error) {
    console.error("Error generating document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
