import { NextResponse } from "next/server"
import { getDemoTransaction } from "@/lib/transactions"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const transaction = await getDemoTransaction(id)

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      id: transaction.id,
      property: transaction.property,
      price: transaction.price,
      buyerName: transaction.buyerName,
      sellerName: transaction.sellerName,
      buyerToken: transaction.buyerToken,
      buyerSigned: transaction.buyerSigned,
      sellerToken: transaction.sellerToken,
      sellerSigned: transaction.sellerSigned,
      addendums: transaction.addendums.map((addendum) => ({
        id: addendum.id,
        title: addendum.title,
        buyerToken: addendum.buyerToken,
        sellerToken: addendum.sellerToken,
        buyerSigned: addendum.buyerSigned,
        sellerSigned: addendum.sellerSigned,
        status: addendum.status,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch transaction:", error)
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    )
  }
}
