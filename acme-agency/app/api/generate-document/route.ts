import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, projectName, changeDescription, budgetImpact } = body

    const templateId = Number(process.env.DOCUMENSO_TEMPLATE_CHANGE_ORDER)
    if (!templateId) {
      return NextResponse.json(
        { error: "Template not configured" },
        { status: 500 }
      )
    }

    const template = await documenso.templates.get({ templateId })

    const recipients = template.recipients.map((r) => ({
      id: r.id,
      name,
      email,
      signingOrder: r.signingOrder,
      role: r.role,
    }))

    const document = await documenso.templates.use({
      templateId,
      recipients,
      distributeDocument: true,
    })

    const signingToken = document.recipients?.[0]?.token

    return NextResponse.json({
      signingToken,
      documentId: document.id,
    })
  } catch (error) {
    console.error("Error creating change order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
