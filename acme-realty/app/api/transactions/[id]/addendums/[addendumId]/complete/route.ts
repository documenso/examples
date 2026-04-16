import { revalidatePath } from "next/cache"
import { AddendumStatus } from "@prisma/client"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const PARTY_FIELD_MAP = {
  buyer: "buyerSigned",
  seller: "sellerSigned",
} as const

type Party = keyof typeof PARTY_FIELD_MAP

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; addendumId: string }> },
) {
  const { id, addendumId } = await params

  try {
    const body = (await request.json()) as { party: Party }

    if (!body.party || !(body.party in PARTY_FIELD_MAP)) {
      return NextResponse.json(
        { error: "Invalid party. Must be: buyer or seller" },
        { status: 400 },
      )
    }

    const addendum = await db.addendum.findUnique({
      where: { id: addendumId },
    })

    if (!addendum || addendum.transactionId !== id) {
      return NextResponse.json(
        { error: "Addendum not found" },
        { status: 404 },
      )
    }

    if (body.party === "seller" && !addendum.buyerSigned) {
      return NextResponse.json(
        { error: "Buyer must sign before seller" },
        { status: 400 },
      )
    }

    const field = PARTY_FIELD_MAP[body.party]
    const nextBuyerSigned = body.party === "buyer" ? true : addendum.buyerSigned
    const nextSellerSigned =
      body.party === "seller" ? true : addendum.sellerSigned
    const nextStatus =
      nextBuyerSigned && nextSellerSigned
        ? AddendumStatus.COMPLETED
        : AddendumStatus.SENT

    const updated = await db.addendum.update({
      where: { id: addendumId },
      data: {
        [field]: true,
        status: nextStatus,
      },
    })

    revalidatePath("/")
    revalidatePath(`/transactions/${id}`)
    revalidatePath(`/transactions/${id}/addendum`)

    return NextResponse.json({
      addendum: {
        id: updated.id,
        title: updated.title,
        buyerToken: updated.buyerToken,
        sellerToken: updated.sellerToken,
        buyerSigned: updated.buyerSigned,
        sellerSigned: updated.sellerSigned,
        status: updated.status,
      },
    })
  } catch (error) {
    console.error("Failed to update addendum signing:", error)
    return NextResponse.json(
      { error: "Failed to update addendum signing" },
      { status: 500 },
    )
  }
}
