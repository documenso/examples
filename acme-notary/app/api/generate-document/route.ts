import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      envelopeId?: string | number
      email?: string
    }

    const envelopeId = String(body.envelopeId ?? "").trim()

    if (!envelopeId) {
      return NextResponse.json(
        { error: "A valid envelopeId is required" },
        { status: 400 }
      )
    }

    const envelope = await documenso.envelopes.get({
      envelopeId,
    })

    let activeRecipients: Array<{ email: string; token?: string | null }> =
      envelope.recipients

    if (envelope.status === "DRAFT") {
      const distributedEnvelope = await documenso.envelopes.distribute({
        envelopeId,
      })
      activeRecipients = distributedEnvelope.recipients
    }

    const activeRecipient = body.email
      ? activeRecipients.find(
          (recipient) =>
            recipient.email.toLowerCase() === body.email?.toLowerCase()
        )
      : undefined

    const signingToken = activeRecipient?.token ?? activeRecipients[0]?.token

    if (!signingToken) {
      return NextResponse.json(
        { error: "No signer token found for this envelope" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      signingToken,
      envelopeId,
    })
  } catch (error) {
    console.error("Generate document error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
