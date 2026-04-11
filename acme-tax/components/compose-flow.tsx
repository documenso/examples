"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { EmbedCreateEnvelopeV2 } from "@documenso/embed-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TaxClient } from "@/lib/mock-data"

type Step = "loading" | "composing" | "sent"

export function ComposeFlow({
  client,
  host,
}: {
  client: TaxClient
  host: string
}) {
  const [step, setStep] = useState<Step>("loading")
  const [presignToken, setPresignToken] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("/api/presign-token", { method: "POST" })

        if (!res.ok) {
          throw new Error("Failed to get presign token")
        }

        const data = await res.json()
        setPresignToken(data.presignToken)
        setStep("composing")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      }
    }

    fetchToken()
  }, [])

  return (
    <>
      <Link
        href={`/clients/${client.id}`}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to {client.name}
      </Link>

      <div className="border-b border-border/70 pt-6 pb-8">
        <p className="text-sm font-medium text-muted-foreground">
          Custom document
        </p>
        <h1 className="mt-3 max-w-[24ch] text-4xl font-semibold tracking-tight text-balance">
          Send a document for review and signature
        </h1>
        <p className="mt-3 max-w-[56ch] text-base text-pretty text-muted-foreground">
          Compose and send a document to {client.name}
        </p>
      </div>

      {step === "loading" && !error && (
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
          <div className="size-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Preparing composer
            </p>
            <p className="text-sm text-muted-foreground">
              Creating a secure session for {client.name}.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-xs border-y border-border/70 py-8">
          <p className="text-sm font-medium text-foreground">
            Unable to start composer
          </p>
          <p className="mt-2 text-sm text-pretty text-destructive">{error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {step === "composing" && (
        <div className="mt-6 overflow-hidden rounded-[min(1vw,12px)] border border-border/70 bg-background">
          <EmbedCreateEnvelopeV2
            className="h-[90dvh] w-full"
            host={host}
            presignToken={presignToken}
            type="DOCUMENT"
            externalId={`acme-tax-client-${client.id}`}
            onEnvelopeCreated={() => setStep("sent")}
          />
        </div>
      )}

      {step === "sent" && (
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 text-center">
          <div className="inline-flex h-8 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-700">
            Sent successfully
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Document sent to {client.name}
            </h2>
            <p className="max-w-[48ch] text-base text-pretty text-muted-foreground">
              The document is out for review and signature. You can return to
              the client record whenever you are ready.
            </p>
          </div>
          <Link
            href={`/clients/${client.id}`}
            className={cn(buttonVariants(), "px-4")}
          >
            Return to client
          </Link>
        </div>
      )}
    </>
  )
}
