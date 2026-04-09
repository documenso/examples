import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"
import { getParticipant } from "@/lib/mock-data"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const participant = getParticipant(id)

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 })
    }

    const envelopeId = request.nextUrl.searchParams.get("envelopeId")

    if (!envelopeId) {
      return NextResponse.json(
        { error: "envelopeId is required" },
        { status: 400 },
      )
    }

    const envelope = await documenso.envelopes.get({ envelopeId })
    const signer =
      envelope.recipients.find((recipient) => recipient.role === "SIGNER") ??
      envelope.recipients[0]

    if (!signer) {
      return NextResponse.json(
        { error: "No signer recipient found for this envelope" },
        { status: 422 },
      )
    }

    return NextResponse.json({
      envelopeId: envelope.id,
      title: envelope.title,
      status: envelope.status,
      consentedAt: signer.signedAt ?? envelope.completedAt ?? envelope.updatedAt,
      signedAt: signer.signedAt,
      signer: {
        id: signer.id,
        name: signer.name,
        email: signer.email,
        signingStatus: signer.signingStatus,
      },
    })
  } catch (error) {
    console.error("Failed to load consent status:", error)
    return NextResponse.json(
      { error: "Failed to verify consent completion" },
      { status: 500 },
    )
  }
}
