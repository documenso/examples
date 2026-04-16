import { notFound } from "next/navigation"
import { AddendumFlow } from "@/components/addendum-flow"
import { getDemoTransaction } from "@/lib/transactions"

export const dynamic = "force-dynamic"

export default async function AddendumPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ addendumId?: string }>
}) {
  const { id } = await params
  const { addendumId } = await searchParams
  const transaction = await getDemoTransaction(id)

  if (!transaction) {
    notFound()
  }

  const addendum = addendumId
    ? transaction.addendums.find((item) => item.id === addendumId) ?? null
    : null

  if (addendumId && !addendum) {
    notFound()
  }

  return (
    <AddendumFlow
      transaction={{
        id: transaction.id,
        property: transaction.property,
        price: transaction.price,
        buyerName: transaction.buyerName,
        buyerEmail: transaction.buyerEmail,
        sellerName: transaction.sellerName,
        sellerEmail: transaction.sellerEmail,
      }}
      initialAddendum={
        addendum
          ? {
              id: addendum.id,
              title: addendum.title,
              buyerToken: addendum.buyerToken,
              sellerToken: addendum.sellerToken,
              buyerSigned: addendum.buyerSigned,
              sellerSigned: addendum.sellerSigned,
              status: addendum.status,
            }
          : null
      }
      host={process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"}
    />
  )
}
