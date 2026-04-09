import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const templateId = Number(process.env.DOCUMENSO_TEMPLATE_ID)

    const template = await documenso.templates.get({ templateId })
    const recipients = template.recipients.map((r) => ({
      id: r.id,
      name: body.name,
      email: body.email,
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
    console.error("Generate document error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
