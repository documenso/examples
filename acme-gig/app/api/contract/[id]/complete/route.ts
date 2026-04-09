import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { party } = body as { party: "client" | "creator" }

    const data =
      party === "client"
        ? { clientSigned: true }
        : { creatorSigned: true }

    const session = await db.gigSession.update({
      where: { id },
      data,
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error("Error completing signing:", error)
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 }
    )
  }
}
