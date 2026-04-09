"use client"

import { use, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmbedSignDocument } from "@documenso/embed-react"
import {
  ArrowLeft,
  Building,
  CheckCircle2,
  Loader2,
  PartyPopper,
  UserCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionData {
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

export default function SignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [txn, setTxn] = useState<TransactionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeParty, setActiveParty] = useState<"buyer" | "seller" | null>(null)
  const [completing, setCompleting] = useState(false)

  const fetchTransaction = useCallback(async () => {
    try {
      const res = await fetch(`/api/transactions/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTxn(data)
      }
    } catch (err) {
      console.error("Failed to fetch transaction:", err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTransaction()
  }, [fetchTransaction])

  const handleDocumentCompleted = useCallback(
    async (party: "buyer" | "seller") => {
      setCompleting(true)
      try {
        const res = await fetch(`/api/transactions/${id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ party }),
        })

        if (!res.ok) {
          console.error("Failed to mark signing complete")
          return
        }

        await fetchTransaction()
      } catch (err) {
        console.error("Error completing signing:", err)
      } finally {
        setActiveParty(null)
        setCompleting(false)
      }
    },
    [id, fetchTransaction],
  )

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!txn) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Transaction not found</p>
      </div>
    )
  }

  const allSigned = txn.buyerSigned && txn.sellerSigned

  if (allSigned) {
    return (
      <div className="mx-auto min-h-svh max-w-3xl p-6 md:p-10">
        <Link
          href={`/transactions/${txn.id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transaction
        </Link>

        <div className="flex flex-col items-center gap-6 py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600/10">
            <PartyPopper className="h-10 w-10 text-emerald-600" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Under Contract!</h2>
            <p className="mt-2 text-muted-foreground">
              Both parties have signed the purchase agreement for{" "}
              {txn.property}. The transaction is now under contract.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const parties = [
    {
      key: "buyer" as const,
      label: "Buyer",
      name: txn.buyerName,
      token: txn.buyerToken,
      signed: txn.buyerSigned,
    },
    {
      key: "seller" as const,
      label: "Seller",
      name: txn.sellerName,
      token: txn.sellerToken,
      signed: txn.sellerSigned,
    },
  ]

  return (
    <div className="mx-auto min-h-svh max-w-3xl p-6 md:p-10">
      <Link
        href={`/transactions/${txn.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Transaction
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/10">
          <Building className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign Purchase Agreement
          </h1>
          <p className="text-sm text-muted-foreground">
            {txn.property} &middot; {txn.price}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {parties.map((party) => {
          const active = activeParty === party.key
          const canSign = !party.signed && party.token
          // Seller only available after buyer signs (demo sequential)
          const locked =
            party.key === "seller" && !txn.buyerSigned && !party.signed

          return (
            <div key={party.key} className="space-y-0">
              <Card
                className={cn(
                  "transition-colors",
                  active && "border-amber-600/50 bg-amber-600/5",
                  party.signed && "border-emerald-600/30 bg-emerald-600/5",
                  locked && "opacity-60",
                )}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      party.signed
                        ? "bg-emerald-600/10 text-emerald-600"
                        : canSign && !locked
                          ? "bg-amber-600/10 text-amber-600"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {party.signed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <UserCheck className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      Sign as {party.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {party.name}
                      {party.signed
                        ? " — Signed"
                        : locked
                          ? " — Awaiting buyer signature"
                          : " — Ready to sign"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {party.signed ? (
                      <Badge
                        variant="default"
                        className="bg-emerald-600 text-white"
                      >
                        Signed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}

                    {canSign && !locked && !active && (
                      <Button
                        size="sm"
                        onClick={() => setActiveParty(party.key)}
                        disabled={completing}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Sign Now
                      </Button>
                    )}

                    {active && completing && (
                      <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {active && party.token && (
                <div className="overflow-hidden rounded-b-lg border border-t-0">
                  <EmbedSignDocument
                    token={party.token}
                    host={
                      process.env.NEXT_PUBLIC_DOCUMENSO_HOST ||
                      "https://app.documenso.com"
                    }
                    onDocumentCompleted={() =>
                      handleDocumentCompleted(party.key)
                    }
                    onDocumentReady={() => {}}
                    onDocumentError={(err) =>
                      console.error("Signing error:", err)
                    }
                    className="h-[600px] w-full"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {txn.buyerSigned && !txn.sellerSigned && !activeParty && (
        <div className="mt-6 rounded-lg border border-amber-600/30 bg-amber-600/5 p-4 text-center">
          <p className="text-sm font-medium text-amber-600">
            Buyer has signed. Click &quot;Sign Now&quot; above to complete the seller
            signature (demo).
          </p>
        </div>
      )}
    </div>
  )
}
