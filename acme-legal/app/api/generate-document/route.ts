import { NextRequest, NextResponse } from "next/server"
import {
  createEngagementDocumentTitle,
  formatMatterDescription,
  getEngagementTemplateFields,
  getTodayIsoDate,
  HOURLY_RATES,
  isMatterType,
} from "@/lib/acme-legal"
import { documenso } from "@/lib/documenso"
import { RETAINER_AMOUNTS } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, matterType, description } = body

    if (!name || !email || !matterType || !description) {
      return NextResponse.json(
        { error: "Name, email, matter type, and description are required" },
        { status: 400 }
      )
    }

    if (!isMatterType(matterType)) {
      return NextResponse.json({ error: "Invalid matter type" }, { status: 400 })
    }

    const templateId = Number(
      process.env.DOCUMENSO_TEMPLATE_ENGAGEMENT_LETTER
    )

    if (!templateId) {
      return NextResponse.json(
        { error: "Template not configured" },
        { status: 500 }
      )
    }

    const template = await documenso.templates.get({ templateId })
    const templateFields = getEngagementTemplateFields(template)

    const recipients = template.recipients.map((r) => ({
      id: r.id,
      name: r.id === templateFields.clientRecipientId ? name : r.name,
      email: r.id === templateFields.clientRecipientId ? email : r.email,
    }))

    const prefillFields = [
      templateFields.engagementDateFieldId
        ? {
            id: templateFields.engagementDateFieldId,
            type: "text" as const,
            value: getTodayIsoDate(),
          }
        : null,
      templateFields.matterTypeFieldId
        ? {
            id: templateFields.matterTypeFieldId,
            type: "text" as const,
            value: matterType,
          }
        : null,
      templateFields.matterDescriptionFieldId
        ? {
            id: templateFields.matterDescriptionFieldId,
            type: "text" as const,
            value: formatMatterDescription({ matterType, description }),
          }
        : null,
      templateFields.retainerAmountFieldId
        ? {
            id: templateFields.retainerAmountFieldId,
            type: "number" as const,
            value: String(RETAINER_AMOUNTS[matterType]),
          }
        : null,
      templateFields.hourlyRateFieldId
        ? {
            id: templateFields.hourlyRateFieldId,
            type: "number" as const,
            value: String(HOURLY_RATES[matterType]),
          }
        : null,
    ].filter((field) => field !== null)

    const document = await documenso.templates.use({
      templateId,
      recipients,
      prefillFields,
      distributeDocument: true,
      override: {
        title: createEngagementDocumentTitle({ name, matterType }),
        subject: createEngagementDocumentTitle({ name, matterType }),
      },
    })

    const signingToken = document.recipients?.find(
      (recipient) => recipient.email === email
    )?.token

    if (!signingToken) {
      return NextResponse.json(
        { error: "Failed to create a signing session for the client" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signingToken,
      documentId: document.id,
    })
  } catch (error) {
    console.error("Error generating engagement letter:", error)
    return NextResponse.json(
      { error: "Failed to generate engagement letter" },
      { status: 500 }
    )
  }
}
