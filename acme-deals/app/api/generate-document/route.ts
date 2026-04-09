import { NextRequest, NextResponse } from "next/server"
import {
  DEAL_NAME,
  getEffectiveDateValue,
  REQUIRED_TEMPLATE_FIELDS,
  normalizeFieldLabel,
} from "@/lib/acme-deal"
import { documenso } from "@/lib/documenso"

function getRequiredString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getEmail(value: unknown) {
  const email = getRequiredString(value).toLowerCase()

  return email.includes("@") ? email : ""
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = getRequiredString(body.name)
    const email = getEmail(body.email)
    const templateId = Number.parseInt(
      process.env.DOCUMENSO_TEMPLATE_ID ?? "",
      10
    )

    if (!name || !email) {
      return NextResponse.json(
        { error: "A valid name and email address are required." },
        { status: 400 }
      )
    }

    if (!Number.isFinite(templateId)) {
      return NextResponse.json(
        { error: "DOCUMENSO_TEMPLATE_ID must be configured." },
        { status: 500 }
      )
    }

    const template = await documenso.templates.get({ templateId })

    const templateFields = new Map(
      template.fields.map((field) => [
        normalizeFieldLabel(field.fieldMeta?.label),
        field,
      ])
    )
    const signerRecipients = template.recipients.filter(
      (recipient) => recipient.role === "SIGNER"
    )

    const receivingPartyField = templateFields.get(
      normalizeFieldLabel(REQUIRED_TEMPLATE_FIELDS.receivingPartyName.label)
    )
    const dealNameField = templateFields.get(
      normalizeFieldLabel(REQUIRED_TEMPLATE_FIELDS.dealName.label)
    )
    const effectiveDateField = templateFields.get(
      normalizeFieldLabel(REQUIRED_TEMPLATE_FIELDS.effectiveDate.label)
    )

    if (
      signerRecipients.length !== 1 ||
      !receivingPartyField ||
      receivingPartyField.fieldMeta?.type !==
        REQUIRED_TEMPLATE_FIELDS.receivingPartyName.fieldType ||
      !dealNameField ||
      dealNameField.fieldMeta?.type !==
        REQUIRED_TEMPLATE_FIELDS.dealName.fieldType ||
      !effectiveDateField ||
      effectiveDateField.fieldMeta?.type !==
        REQUIRED_TEMPLATE_FIELDS.effectiveDate.fieldType
    ) {
      return NextResponse.json(
        {
          error:
            "The NDA template must have exactly one signer recipient and labeled fields Receiving Party Name (name), Deal Name (text), and Effective Date (date).",
        },
        { status: 500 }
      )
    }

    const [signerRecipient] = signerRecipients
    const recipients = [
      {
        id: signerRecipient.id,
        name,
        email,
      },
    ]

    const document = await documenso.templates.use({
      templateId,
      recipients,
      prefillFields: [
        {
          id: dealNameField.id,
          type: "text",
          value: DEAL_NAME,
        },
        {
          id: effectiveDateField.id,
          type: "date",
          value: getEffectiveDateValue(),
        },
      ],
      distributeDocument: true,
    })

    const signingToken = document.recipients?.[0]?.token

    if (!signingToken) {
      return NextResponse.json(
        { error: "The NDA document was created without a signing token." },
        { status: 500 }
      )
    }

    return NextResponse.json({ signingToken, documentId: document.id })
  } catch (error) {
    console.error("Error generating document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
