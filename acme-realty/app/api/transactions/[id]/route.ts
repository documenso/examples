import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const transaction = await db.transaction.findUnique({
      where: { id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Failed to fetch transaction:", error)
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    )
  }
}
