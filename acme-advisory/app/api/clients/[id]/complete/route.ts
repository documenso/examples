import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

const validDocs = ["ima", "fee", "adv"] as const
type DocKey = (typeof validDocs)[number]

const signedFieldMap: Record<DocKey, "imaSigned" | "feeSigned" | "advSigned"> = {
  ima: "imaSigned",
  fee: "feeSigned",
  adv: "advSigned",
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const doc = body.document as string

    if (!validDocs.includes(doc as DocKey)) {
      return NextResponse.json(
        { error: "Invalid document. Must be ima, fee, or adv" },
        { status: 400 }
      )
    }

    const field = signedFieldMap[doc as DocKey]

    const session = await db.clientSession.update({
      where: { id },
      data: { [field]: true },
    })

    // Check if all docs are now signed — move to active
    if (session.imaSigned && session.feeSigned && session.advSigned) {
      await db.clientSession.update({
        where: { id },
        data: { pipelineStage: "active" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error completing document:", error)
    return NextResponse.json(
      { error: "Failed to complete document" },
      { status: 500 }
    )
  }
}
