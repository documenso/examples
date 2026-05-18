"use client"

import { useState } from "react"
import Link from "next/link"
import { EmbedSignDocument } from "@documenso/embed-react"

import { buttonVariants } from "@/components/ui/button"
import { useClientStatuses } from "@/hooks/use-client-statuses"
import { cn } from "@/lib/utils"
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
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 text-center">
        <div className="inline-flex h-8 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-700">
          Signature complete
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Form 8879 has been signed
          </h2>
          <p className="max-w-[48ch] text-base text-pretty text-muted-foreground">
            Form 8879 has been signed for {client.name}. The return will be
            e-filed with the IRS.
          </p>
        </div>
        <Link
          href={`/clients/${client.id}`}
          className={cn(buttonVariants(), "px-4")}
        >
          Return to client
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-8">
        <Link
          href={`/clients/${client.id}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Back to {client.name}
        </Link>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Form 8879</p>
          <h1 className="max-w-[24ch] text-4xl font-semibold tracking-tight text-balance">
            Review and sign e-file authorization
          </h1>
          <p className="max-w-[56ch] text-base text-pretty text-muted-foreground">
            {client.name} is reviewing the 2025 authorization form before the
            return is filed.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[min(1vw,12px)] border border-border/70 bg-background">
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
