import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { serializeGigSession } from "@/lib/gig-session"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await db.gigSession.findUnique({
      where: { id },
    })

    if (!session) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(serializeGigSession(session))
  } catch (error) {
    console.error("Error fetching contract:", error)
    return NextResponse.json(
      { error: "Failed to fetch contract" },
      { status: 500 }
    )
  }
}
