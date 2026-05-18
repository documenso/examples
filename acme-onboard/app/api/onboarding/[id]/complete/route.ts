import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const DOCUMENT_FIELD_MAP = {
  offer: "offerSigned",
  nda: "ndaSigned",
  handbook: "handbookSigned",
} as const

type DocumentType = keyof typeof DOCUMENT_FIELD_MAP

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const body = (await request.json()) as { document: DocumentType }

    if (!body.document || !(body.document in DOCUMENT_FIELD_MAP)) {
      return NextResponse.json(
        { error: "Invalid document type. Must be: offer, nda, or handbook" },
        { status: 400 },
      )
    }

    const session = await db.onboardingSession.findUnique({
      where: { id },
    })

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 },
      )
    }

    // Enforce sequential signing order
    if (body.document === "nda" && !session.offerSigned) {
      return NextResponse.json(
        { error: "Offer letter must be signed before NDA" },
        { status: 400 },
      )
    }

    if (body.document === "handbook" && !session.ndaSigned) {
      return NextResponse.json(
        { error: "NDA must be signed before handbook" },
        { status: 400 },
      )
    }

    const field = DOCUMENT_FIELD_MAP[body.document]

    const updated = await db.onboardingSession.update({
      where: { id },
      data: { [field]: true },
    })

    const signedCount = [
      updated.offerSigned,
      updated.ndaSigned,
      updated.handbookSigned,
    ].filter(Boolean).length

    return NextResponse.json({
      success: true,
      signedCount,
      complete: signedCount === 3,
    })
  } catch (error) {
    console.error("Failed to mark document complete:", error)
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 },
    )
  }
}
