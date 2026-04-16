"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EmbedSignDocument } from "@documenso/embed-react"
import {
  CheckCircle2,
  ChevronLeft,
  Loader2,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PurchaseAgreementSignerProps {
  initialTransaction: {
    id: string
    property: string
    price: string
    buyerName: string
    sellerName: string
    buyerToken: string | null
    buyerSigned: boolean
    sellerToken: string | null
    sellerSigned: boolean
  }
  host: string
}

export function PurchaseAgreementSigner({
  initialTransaction,
  host,
}: PurchaseAgreementSignerProps) {
  const router = useRouter()
  const [transaction, setTransaction] = useState(initialTransaction)
  const [activeParty, setActiveParty] = useState<"buyer" | "seller" | null>(
    null,
  )
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshTransaction = useCallback(async () => {
    const response = await fetch(`/api/transactions/${initialTransaction.id}`)

    if (!response.ok) {
      throw new Error("Failed to refresh transaction state")
    }

    const data = (await response.json()) as PurchaseAgreementSignerProps["initialTransaction"]
    setTransaction(data)
  }, [initialTransaction.id])

  const handleDocumentCompleted = useCallback(
    async (party: "buyer" | "seller") => {
      setCompleting(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/transactions/${initialTransaction.id}/complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ party }),
          },
        )

        const data = (await response.json()) as { error?: string }

        if (!response.ok) {
          setError(data.error ?? "Failed to record the signature.")
          return
        }

        await refreshTransaction()
        router.refresh()
      } catch (caughtError) {
        console.error("Failed to complete purchase agreement signing:", caughtError)
        setError("Failed to record the signature.")
      } finally {
        setActiveParty(null)
        setCompleting(false)
      }
    },
    [initialTransaction.id, refreshTransaction, router],
  )

  const allSigned = transaction.buyerSigned && transaction.sellerSigned
  const nextPrimaryParty =
    !transaction.buyerSigned && transaction.buyerToken
      ? "buyer"
      : !transaction.sellerSigned && transaction.sellerToken
        ? "seller"
        : null

  if (allSigned) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href={`/transactions/${transaction.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ChevronLeft className="size-4 shrink-0" />
          Back to transaction
        </Link>

        <div className="mx-auto flex max-w-xl flex-col gap-6 py-20 text-center">
          <div className="inline-flex items-center justify-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="size-4 shrink-0" />
            Complete
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              Purchase agreement complete.
            </h1>
            <p className="text-base text-pretty text-muted-foreground">
              Both parties have signed for {transaction.property}. The
              transaction can now move under contract.
            </p>
          </div>
          <Link
            href={`/transactions/${transaction.id}`}
            className={buttonVariants()}
          >
            Return to transaction
          </Link>
        </div>
      </div>
    )
  }

  const parties = [
    {
      key: "buyer" as const,
      label: "Buyer",
      name: transaction.buyerName,
      token: transaction.buyerToken,
      signed: transaction.buyerSigned,
    },
    {
      key: "seller" as const,
      label: "Seller",
      name: transaction.sellerName,
      token: transaction.sellerToken,
      signed: transaction.sellerSigned,
    },
  ]
  const activeSigner = parties.find((party) => party.key === activeParty) ?? null

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/transactions/${transaction.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ChevronLeft className="size-4 shrink-0" />
        Back to transaction
      </Link>

      <section className="flex flex-col gap-3 border-b border-border/80 py-8">
        <p className="text-sm font-medium text-muted-foreground">
          Purchase agreement
        </p>
        <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance">
          Signature routing for {transaction.property}.
        </h1>
        <p className="text-base text-pretty text-muted-foreground">
          {transaction.price} · buyer signs first, then seller finalizes the
          file.
        </p>
      </section>

      <section className="grid gap-10 py-8 lg:grid-cols-[15fr_21fr]">
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Signing order
            </h2>
            <p className="text-sm text-pretty text-muted-foreground">
              Each signer opens the same agreement from their own secure link.
            </p>
          </div>

          <div className="divide-y divide-border/80 border-y border-border/80">
        {parties.map((party) => {
          const active = activeParty === party.key
          const canSign = !party.signed && party.token
          const locked =
            party.key === "seller" &&
            !transaction.buyerSigned &&
            !transaction.sellerSigned

          return (
            <div
              key={party.key}
              className={cn(
                "space-y-4 py-4",
                active && "bg-muted/20",
                locked && "opacity-60",
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        party.signed
                          ? "bg-emerald-500"
                          : active
                            ? "bg-primary"
                            : "bg-zinc-400 dark:bg-zinc-500",
                      )}
                    />
                    {party.label}
                  </div>
                  <p className="text-sm text-foreground">{party.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {party.signed
                      ? "Signed"
                      : locked
                        ? "Waiting for buyer signature"
                        : "Ready to review and sign"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {active && completing ? (
                    <Loader2 className="size-4 animate-spin shrink-0 text-muted-foreground" />
                  ) : null}

                  {canSign && !locked && !active ? (
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        nextPrimaryParty === party.key ? "default" : "outline"
                      }
                      onClick={() => setActiveParty(party.key)}
                      disabled={completing}
                    >
                      Sign now
                    </Button>
                  ) : null}
                </div>
              </div>

            </div>
          )
        })}
          </div>

          {transaction.buyerSigned && !transaction.sellerSigned && !activeParty ? (
            <p className="text-sm text-muted-foreground">
              Buyer signature recorded. Open the seller step to complete the
              agreement.
            </p>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="space-y-4 border-t border-border/80 pt-8 lg:border-t-0 lg:border-l lg:border-border/80 lg:pl-10 lg:pt-0">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Current document
            </h2>
            <p className="text-sm text-pretty text-muted-foreground">
              Open a signer step to load the embedded Documenso workflow.
            </p>
          </div>

          {activeParty ? (
            <p className="text-sm text-muted-foreground">
              The {activeParty} signer is ready. Complete the embedded document
              to update the file state.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No signer is currently active. Start with the next available
              party.
            </p>
          )}

          {activeSigner?.token ? (
            <div className="overflow-hidden rounded-xl border border-border/80 bg-background">
              <EmbedSignDocument
                token={activeSigner.token}
                host={host}
                onDocumentCompleted={() =>
                  handleDocumentCompleted(activeSigner.key)
                }
                onDocumentError={(documentError) => {
                  console.error("Purchase agreement signing error:", documentError)
                  setError("The signing flow failed to load.")
                }}
                className="h-[720px] w-full"
              />
            </div>
          ) : null}

          <Link
            href={`/transactions/${transaction.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Return to file
          </Link>
        </div>
      </section>
    </div>
  )
}
