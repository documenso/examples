import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const PARTY_FIELD_MAP = {
  buyer: "buyerSigned",
  seller: "sellerSigned",
} as const

type Party = keyof typeof PARTY_FIELD_MAP

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const body = (await request.json()) as { party: Party }

    if (!body.party || !(body.party in PARTY_FIELD_MAP)) {
      return NextResponse.json(
        { error: "Invalid party. Must be: buyer or seller" },
        { status: 400 },
      )
    }

    const transaction = await db.transaction.findUnique({
      where: { id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      )
    }

    // Enforce sequential: seller can only sign after buyer
    if (body.party === "seller" && !transaction.buyerSigned) {
      return NextResponse.json(
        { error: "Buyer must sign before seller" },
        { status: 400 },
      )
    }

    const field = PARTY_FIELD_MAP[body.party]

    const updated = await db.transaction.update({
      where: { id },
      data: { [field]: true },
    })

    return NextResponse.json({
      success: true,
      buyerSigned: updated.buyerSigned,
      sellerSigned: updated.sellerSigned,
      complete: updated.buyerSigned && updated.sellerSigned,
    })
  } catch (error) {
    console.error("Failed to mark signing complete:", error)
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 },
    )
  }
}
