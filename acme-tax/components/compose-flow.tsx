"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { EmbedCreateEnvelopeV2 } from "@documenso/embed-react"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {client.name}
      </Link>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Send Custom Document</h2>
        <p className="text-sm text-muted-foreground">
          Compose and send a document to {client.name}
        </p>
      </div>

      {step === "loading" && !error && (
        <div className="flex h-[90dvh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "composing" && (
        <div className="overflow-hidden rounded-lg border">
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
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
            <h2 className="mb-2 text-xl font-semibold">Document Sent</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Your document has been sent to {client.name} for review and
              signing.
            </p>
            <Link href={`/clients/${client.id}`} className={buttonVariants()}>Return to Client</Link>
          </CardContent>
        </Card>
      )}
    </>
  )
}
