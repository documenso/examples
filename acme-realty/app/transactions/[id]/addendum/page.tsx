"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { unstable_EmbedCreateDocument as EmbedCreateDocument } from "@documenso/embed-react"
import { ArrowLeft, Building, Loader2 } from "lucide-react"
import { TRANSACTIONS } from "@/lib/mock-data"

export default function AddendumPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const txn = TRANSACTIONS.find((t) => t.id === id)
  const [presignToken, setPresignToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("/api/presign-token", { method: "POST" })
        if (res.ok) {
          const data = await res.json()
          setPresignToken(data.presignToken)
        }
      } catch (err) {
        console.error("Failed to get presign token:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchToken()
  }, [])

  if (!txn) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Transaction not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-svh max-w-5xl p-6 md:p-10">
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
            Add Custom Addendum
          </h1>
          <p className="text-sm text-muted-foreground">
            {txn.property} &middot; {txn.price}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : presignToken ? (
        <div className="overflow-hidden rounded-lg border">
          <EmbedCreateDocument
            className="h-[80dvh] w-full"
            host={
              process.env.NEXT_PUBLIC_DOCUMENSO_HOST ||
              "https://app.documenso.com"
            }
            presignToken={presignToken}
            onDocumentCreated={() => {
              window.location.href = `/transactions/${txn.id}`
            }}
          />
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">
            Failed to initialize document authoring. Check your API
            configuration.
          </p>
        </div>
      )}
    </div>
  )
}
