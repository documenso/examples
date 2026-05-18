import { notFound } from "next/navigation"
import { PurchaseAgreementSigner } from "@/components/purchase-agreement-signer"
import { getDemoTransaction } from "@/lib/transactions"

export const dynamic = "force-dynamic"

export default async function SignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const transaction = await getDemoTransaction(id)

  if (!transaction) {
    notFound()
  }

  return (
    <PurchaseAgreementSigner
      initialTransaction={{
        id: transaction.id,
        property: transaction.property,
        price: transaction.price,
        buyerName: transaction.buyerName,
        sellerName: transaction.sellerName,
        buyerToken: transaction.buyerToken,
        buyerSigned: transaction.buyerSigned,
        sellerToken: transaction.sellerToken,
        sellerSigned: transaction.sellerSigned,
      }}
      host={process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"}
    />
  )
}
