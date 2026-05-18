import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const session = await db.onboardingSession.findUnique({
    where: { id },
  })

  if (!session) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 },
    )
  }

  return NextResponse.json({
    id: session.id,
    employeeName: session.employeeName,
    email: session.email,
    role: session.role,
    startDate: session.startDate,
    salary: session.salary,
    offerToken: session.offerToken,
    offerSigned: session.offerSigned,
    ndaToken: session.ndaToken,
    ndaSigned: session.ndaSigned,
    handbookToken: session.handbookToken,
    handbookSigned: session.handbookSigned,
  })
}
