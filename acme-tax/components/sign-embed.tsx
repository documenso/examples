"use client"

import { useState } from "react"
import Link from "next/link"
import { EmbedSignDocument } from "@documenso/embed-react"
import { ArrowLeft, CheckCircle } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { useClientStatuses } from "@/hooks/use-client-statuses"
import type { TaxClient } from "@/lib/mock-data"

export function SignEmbed({
  client,
  host,
  token,
}: {
  client: TaxClient
  host: string
  token: string
}) {
  const { updateClientStatus } = useClientStatuses()
  const [complete, setComplete] = useState(false)

  if (complete) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
        <CheckCircle className="h-12 w-12 text-emerald-500" />
        <h2 className="text-xl font-semibold">8879 Signed</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Form 8879 has been signed for {client.name}. The return will be
          e-filed with the IRS.
        </p>
        <Link href={`/clients/${client.id}`} className={buttonVariants()}>
          Return to Client
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Sign Form 8879</h2>
          <p className="text-sm text-muted-foreground">
            {client.name} — Tax Year 2025
          </p>
        </div>
        <Link
          href={`/clients/${client.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {client.name}
        </Link>
      </div>
      <div className="overflow-hidden rounded-3xl border bg-background">
        <EmbedSignDocument
          token={token}
          host={host}
          onDocumentCompleted={() => {
            updateClientStatus(client.id, "signed")
            setComplete(true)
          }}
          className="h-[90dvh] w-full"
        />
      </div>
    </div>
  )
}
