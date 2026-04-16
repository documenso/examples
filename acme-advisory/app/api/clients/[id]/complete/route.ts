import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

const validDocs = ["ima", "fee", "adv"] as const

type DocKey = (typeof validDocs)[number]

type SessionState = {
  imaSigned: boolean
  feeSigned: boolean
  advSigned: boolean
}

function isDocumentSigned(session: SessionState, document: DocKey) {
  if (document === "ima") {
    return session.imaSigned
  }

  if (document === "fee") {
    return session.feeSigned
  }

  return session.advSigned
}

function getOrderViolation(session: SessionState, document: DocKey) {
  if (document === "fee" && !session.imaSigned) {
    return "The IMA must be signed before the fee acknowledgment."
  }

  if (document === "adv" && (!session.imaSigned || !session.feeSigned)) {
    return "The ADV disclosure is only available after the IMA and fee acknowledgment are signed."
  }

  return null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const documentKey = body.document as string

    if (!validDocs.includes(documentKey as DocKey)) {
      return NextResponse.json(
        { error: "Invalid document. Must be ima, fee, or adv" },
        { status: 400 }
      )
    }

    const document = documentKey as DocKey
    const session = await db.clientSession.findUnique({ where: { id } })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const orderViolation = getOrderViolation(session, document)

    if (orderViolation) {
      return NextResponse.json({ error: orderViolation }, { status: 409 })
    }

    if (!isDocumentSigned(session, document)) {
      const updateCount =
        document === "ima"
          ? await db.clientSession.updateMany({
              where: { id, imaSigned: false },
              data: { imaSigned: true },
            })
          : document === "fee"
            ? await db.clientSession.updateMany({
                where: { id, imaSigned: true, feeSigned: false },
                data: { feeSigned: true },
              })
            : await db.clientSession.updateMany({
                where: { id, imaSigned: true, feeSigned: true, advSigned: false },
                data: { advSigned: true },
              })

      if (updateCount.count === 0) {
        const latestSession = await db.clientSession.findUnique({ where: { id } })

        if (!latestSession) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        if (!isDocumentSigned(latestSession, document)) {
          return NextResponse.json(
            { error: "Unable to mark document as signed" },
            { status: 409 }
          )
        }
      }
    }

    const latestSession = await db.clientSession.findUnique({ where: { id } })

    if (!latestSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const pipelineStage =
      latestSession.imaSigned && latestSession.feeSigned && latestSession.advSigned
        ? "active"
        : "onboarding"

    if (latestSession.pipelineStage !== pipelineStage) {
      await db.clientSession.update({
        where: { id },
        data: { pipelineStage },
      })
    }

    return NextResponse.json({
      success: true,
      pipelineStage,
    })
  } catch (error) {
    console.error("Error completing document:", error)
    return NextResponse.json(
      { error: "Failed to complete document" },
      { status: 500 }
    )
  }
}
