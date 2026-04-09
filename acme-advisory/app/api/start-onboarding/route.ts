import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"
import { db } from "@/lib/db"

async function createDocFromTemplate(
  templateId: number,
  name: string,
  email: string
): Promise<string> {
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

  const token = document.recipients?.[0]?.token
  if (!token) throw new Error(`No signing token returned for template ${templateId}`)
  return token
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientName, email, aum, fee } = body

    if (!clientName || !email) {
      return NextResponse.json(
        { error: "clientName and email are required" },
        { status: 400 }
      )
    }

    const imaTemplateId = Number(process.env.DOCUMENSO_TEMPLATE_IMA)
    const feeTemplateId = Number(process.env.DOCUMENSO_TEMPLATE_FEE_ACK)
    const advTemplateId = Number(process.env.DOCUMENSO_TEMPLATE_ADV_DISCLOSURE)

    // Create all 3 documents in parallel
    const [imaToken, feeToken, advToken] = await Promise.all([
      createDocFromTemplate(imaTemplateId, clientName, email),
      createDocFromTemplate(feeTemplateId, clientName, email),
      createDocFromTemplate(advTemplateId, clientName, email),
    ])

    const session = await db.clientSession.create({
      data: {
        clientName,
        email,
        aum: aum || "",
        fee: fee || "",
        pipelineStage: "onboarding",
        imaToken,
        feeToken,
        advToken,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Error starting onboarding:", error)
    return NextResponse.json(
      { error: "Failed to start onboarding" },
      { status: 500 }
    )
  }
}
