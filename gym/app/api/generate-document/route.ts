import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const templateId = process.env.DOCUMENSO_TEMPLATE_ID

    if (!templateId) {
      return NextResponse.json(
        { error: "Documenso template ID not configured" },
        { status: 500 },
      )
    }

    const templateIdNumber = Number(templateId)

    const template = await documenso.templates.get({ templateId: templateIdNumber })
    const templateRecipients = template.recipients || []

    if (templateRecipients.length === 0) {
      return NextResponse.json({ error: "Template has no recipients configured" }, { status: 400 })
    }

    const recipients = templateRecipients.map((recipient) => ({
      id: recipient.id,
      name,
      email,
      signingOrder: recipient.signingOrder,
      role: recipient.role,
    }))

    const document = await documenso.templates.use({
      templateId: templateIdNumber,
      recipients,
      distributeDocument: true,
    })

    const signingToken = document.recipients?.[0]?.token

    if (!signingToken) {
      return NextResponse.json({ error: "No signing token received from Documenso" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      signingToken,
      documentId: document.id,
    })
  } catch (error) {
    console.error("Error generating document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
