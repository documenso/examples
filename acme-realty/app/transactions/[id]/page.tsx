import Link from "next/link"
import { AddendumStatus, TransactionStatus } from "@prisma/client"
import { notFound } from "next/navigation"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  FilePlus2,
} from "lucide-react"
import {
  getDemoTransaction,
  getTransactionStatusLabel,
} from "@/lib/transactions"
import { SendPurchaseAgreementDialog } from "@/components/send-purchase-agreement-dialog"

export const dynamic = "force-dynamic"

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const transaction = await getDemoTransaction(id)

  if (!transaction) {
    notFound()
  }

  const isDraft = transaction.status === TransactionStatus.DRAFT
  const isClosed = transaction.status === TransactionStatus.CLOSED
  const purchaseAgreementSigned = transaction.buyerSigned && transaction.sellerSigned
  const purchaseAgreementSent = Boolean(transaction.documentId)
  const statusTone: Record<TransactionStatus, string> = {
    [TransactionStatus.DRAFT]: "bg-zinc-400 dark:bg-zinc-500",
    [TransactionStatus.UNDER_CONTRACT]: "bg-amber-500",
    [TransactionStatus.CLOSED]: "bg-emerald-500",
  }

  const documents = [
    ...(purchaseAgreementSent
      ? [
          {
            id: "purchase-agreement",
            name: "Purchase Agreement",
            signed: purchaseAgreementSigned,
            href: purchaseAgreementSigned
              ? null
              : `/transactions/${transaction.id}/sign`,
            statusLabel: purchaseAgreementSigned
              ? "Completed"
              : "Awaiting signatures",
          },
        ]
      : []),
    ...transaction.addendums.map((addendum) => ({
      id: addendum.id,
      name: addendum.title,
      signed: addendum.status === AddendumStatus.COMPLETED,
      href:
        addendum.status === AddendumStatus.COMPLETED
          ? null
          : `/transactions/${transaction.id}/addendum?addendumId=${addendum.id}`,
      statusLabel:
        addendum.status === AddendumStatus.COMPLETED
          ? "Completed"
          : "Awaiting signatures",
    })),
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ChevronLeft className="size-4 shrink-0" />
        Back to transactions
      </Link>

      <section className="flex flex-col gap-5 border-b border-border/80 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Transaction file
          </p>
          <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance">
            {transaction.property}
          </h1>
          <p className="text-base text-pretty text-muted-foreground tabular-nums">
            {transaction.price}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <span
            aria-hidden="true"
            className={`size-2 shrink-0 rounded-full ${statusTone[transaction.status]}`}
          />
          {getTransactionStatusLabel(transaction.status)}
        </div>
      </section>

      <section className="grid gap-10 py-8 lg:grid-cols-[19fr_13fr]">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Parties</h2>
              <p className="text-sm text-pretty text-muted-foreground">
                Contact information used for signature routing and follow-up.
              </p>
            </div>
            <dl className="divide-y divide-border/80 border-y border-border/80">
              <div className="grid gap-2 py-4 sm:grid-cols-[120px_1fr] sm:gap-6">
                <dt className="text-sm font-medium text-foreground">Buyer</dt>
                <dd className="space-y-1 text-sm text-muted-foreground">
                  <p className="text-foreground">{transaction.buyerName}</p>
                  <p>{transaction.buyerEmail ?? "No email on file"}</p>
                </dd>
              </div>
              <div className="grid gap-2 py-4 sm:grid-cols-[120px_1fr] sm:gap-6">
                <dt className="text-sm font-medium text-foreground">Seller</dt>
                <dd className="space-y-1 text-sm text-muted-foreground">
                  <p className="text-foreground">{transaction.sellerName}</p>
                  <p>{transaction.sellerEmail ?? "No email on file"}</p>
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Documents</h2>
              <p className="text-sm text-pretty text-muted-foreground">
                Purchase agreements and custom addendums tied to this file.
              </p>
            </div>
            {documents.length === 0 ? (
              <div className="border-y border-border/80 py-6">
                <p className="text-sm text-muted-foreground">
                  No documents yet. Send the purchase agreement to begin the
                  file.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/80 border-y border-border/80">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                        <FileText className="size-4 shrink-0" />
                        {document.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:justify-self-end">
                      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className={`size-2 shrink-0 rounded-full ${
                            document.signed ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {document.statusLabel}
                      </div>

                      {document.href ? (
                        <Link
                          href={document.href}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Continue
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 border-t border-border/80 pt-8 lg:border-t-0 lg:border-l lg:border-border/80 lg:pl-8 lg:pt-0">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Next action</h2>
            <p className="text-sm text-pretty text-muted-foreground">
              Keep the file moving with the next highest-priority task.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {isDraft && !purchaseAgreementSent ? (
              <SendPurchaseAgreementDialog
                transactionId={transaction.id}
                property={transaction.property}
                buyerName={transaction.buyerName}
                sellerName={transaction.sellerName}
                buyerEmail={transaction.buyerEmail}
                sellerEmail={transaction.sellerEmail}
                className="w-full justify-start"
              />
            ) : null}

            {!purchaseAgreementSigned && purchaseAgreementSent ? (
              <Link
                href={`/transactions/${transaction.id}/sign`}
                className={buttonVariants({
                  size: "default",
                  className: "w-full justify-start",
                })}
              >
                Continue Purchase Agreement
              </Link>
            ) : null}

            {!isClosed ? (
              <Link
                href={`/transactions/${transaction.id}/addendum`}
                className={buttonVariants({
                  variant: "outline",
                  size: "default",
                  className: "w-full justify-start",
                })}
              >
                <FilePlus2 className="size-4 shrink-0" />
                Add custom addendum
              </Link>
            ) : null}

            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View all transactions
              <ChevronRight className="size-4 shrink-0" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
