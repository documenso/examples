import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const apiKey = process.env.DOCUMENSO_API_KEY
    const templateId = process.env.DOCUMENSO_TEMPLATE_ID
    const documensoHost = process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

    if (!apiKey || !templateId) {
      return NextResponse.json(
        { error: "Documenso API key or template ID not configured" },
        { status: 500 },
      )
    }

    const templateResponse = await fetch(`${documensoHost}/api/v2-beta/template/${templateId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!templateResponse.ok) {
      const errorText = await templateResponse.text()
      return NextResponse.json(
        { error: "Failed to fetch template details", details: errorText },
        { status: templateResponse.status },
      )
    }

    const templateData = await templateResponse.json()
    const templateRecipients = templateData.recipients || []

    if (templateRecipients.length === 0) {
      return NextResponse.json({ error: "Template has no recipients configured" }, { status: 400 })
    }

    const recipients = templateRecipients.map((recipient: { id: number; signingOrder: number; role: string }) => ({
      id: recipient.id,
      name,
      email,
      signingOrder: recipient.signingOrder,
      role: recipient.role,
    }))

    const response = await fetch(`${documensoHost}/api/v2-beta/template/use`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        templateId: parseInt(templateId),
        recipients,
        distributeDocument: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "Failed to generate document", details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    const signingToken = data.recipients?.[0]?.token

    if (!signingToken) {
      return NextResponse.json({ error: "No signing token received from Documenso" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      signingToken,
      documentId: data.documentId,
    })
  } catch (error) {
    console.error("Error generating document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
