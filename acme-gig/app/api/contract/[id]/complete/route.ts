import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { documenso } from "@/lib/documenso"
import {
  buildGigSessionSyncData,
  serializeGigSession,
} from "@/lib/gig-session"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await db.gigSession.findUnique({
      where: { id },
    })

    if (!session || !session.documentId) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      )
    }

    const document = await documenso.documents.get({
      documentId: Number(session.documentId),
    })

    const data = buildGigSessionSyncData(session, document)

    const updatedSession = await db.gigSession.update({
      where: { id: session.id },
      data,
    })

    return NextResponse.json(serializeGigSession(updatedSession))
  } catch (error) {
    console.error("Error completing signing:", error)
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 }
    )
  }
}
