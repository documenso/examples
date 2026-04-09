import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientName,
      clientEmail,
      creatorName,
      deliverables,
      deadline,
      budget,
      usageRights,
    } = body

    const templateId = Number(process.env.DOCUMENSO_TEMPLATE_ID)
    const template = await documenso.templates.get({ templateId })

    const sortedRecipients = [...template.recipients].sort(
      (a, b) => (a.signingOrder ?? 0) - (b.signingOrder ?? 0)
    )

    const recipients = sortedRecipients.map((r, i) => ({
      id: r.id,
      name: i === 0 ? clientName : creatorName,
      email: i === 0 ? clientEmail : "jordan@acmegig.demo",
      signingOrder: r.signingOrder,
      role: r.role,
    }))

    const document = await documenso.templates.use({
      templateId,
      recipients,
      distributeDocument: true,
    })

    const clientToken = document.recipients?.[0]?.token ?? null
    const creatorToken = document.recipients?.[1]?.token ?? null

    const session = await db.gigSession.create({
      data: {
        clientEmail,
        clientName,
        deliverables,
        deadline,
        budget,
        usageRights,
        clientToken,
        creatorToken,
        documentId: String(document.id),
      },
    })

    return NextResponse.json({ id: session.id })
  } catch (error) {
    console.error("Error creating contract:", error)
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    )
  }
}
