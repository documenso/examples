import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const envelopeId = String(body.envelopeId ?? "").trim()

    if (!envelopeId) {
      return NextResponse.json(
        { error: "Envelope ID is required" },
        { status: 400 }
      )
    }

    const envelope = await documenso.envelopes.get({ envelopeId })

    const signingToken =
      envelope.status === "DRAFT"
        ? (
            await documenso.envelopes.distribute({
              envelopeId,
            })
          ).recipients.find((recipient) => recipient.token)?.token
        : envelope.recipients.find((recipient) => recipient.token)?.token

    if (!signingToken) {
      return NextResponse.json(
        { error: "No signing token found for envelope recipients" },
        { status: 404 }
      )
    }

    return NextResponse.json({ signingToken })
  } catch (error) {
    console.error("Error fetching signing token:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
