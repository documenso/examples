"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  EmbedCreateEnvelopeV2 as EmbedCreateEnvelope,
  EmbedUpdateEnvelopeV2 as EmbedUpdateEnvelope,
} from "@documenso/embed-react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { buttonVariants } from "@/components/ui/button"
import type { NotarySession } from "@/lib/mock-data"
import { getStoredSessionState, updateStoredSessionState } from "@/lib/session-state"

export function PrepareDocument({ session }: { session: NotarySession }) {
  const [presignToken, setPresignToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)
  const [isPreparingSession, setIsPreparingSession] = useState(false)
  const [envelopeId, setEnvelopeId] = useState<string | null>(null)

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  useEffect(() => {
    const storedSessionState = getStoredSessionState(session.id)

    if (storedSessionState?.envelopeId) {
      setEnvelopeId(storedSessionState.envelopeId)
    }

    async function fetchToken() {
      try {
        const res = await fetch("/api/presign-token", { method: "POST" })
        if (!res.ok) throw new Error("Failed to get presign token")
        const data = await res.json()
        setPresignToken(data.presignToken)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }
    fetchToken()
  }, [session.clientEmail, session.id])

  const handleEnvelopeCreated = useCallback(async (data: { envelopeId: number }) => {
    const nextEnvelopeId = String(data.envelopeId)

    setEnvelopeId(nextEnvelopeId)
    setIsPreparingSession(true)

    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          envelopeId: nextEnvelopeId,
          email: session.clientEmail,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }

        throw new Error(payload.error ?? "Failed to send the envelope for signing")
      }

      updateStoredSessionState(session.id, {
        status: "prepared",
        documentId: undefined,
        envelopeId: nextEnvelopeId,
        preparedAt: new Date().toISOString(),
      })
      setCreated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsPreparingSession(false)
    }
  }, [session.clientEmail, session.id])

  const handleEnvelopeUpdated = useCallback((data: { envelopeId: string }) => {
    setEnvelopeId(data.envelopeId)
    updateStoredSessionState(session.id, {
      status: "prepared",
      documentId: undefined,
      envelopeId: data.envelopeId,
      preparedAt: new Date().toISOString(),
    })
  }, [session.id])

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-lg border-zinc-950/10">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (created) {
    return (
      <section className="py-20">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-base/6 font-medium text-emerald-600 sm:text-sm/6">
              <CheckCircle2 className="size-4 h-lh shrink-0 stroke-emerald-600" />
              Ready for signing
            </p>
            <div className="space-y-2">
              <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight text-balance text-zinc-950">
                The document is prepared.
              </h2>
              <p className="max-w-[56ch] text-base/7 text-pretty text-zinc-500 sm:text-sm/6">
                The {session.documentType.toLowerCase()} for {session.clientName}{" "}
                has been prepared and can now move into the live notarization
                session.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-base/7 text-zinc-500 sm:text-sm/6">
            <p>
              <span className="font-medium text-zinc-950">Signer:</span>{" "}
              {session.clientName}
            </p>
            <p>
              <span className="font-medium text-zinc-950">Document:</span>{" "}
              {session.documentType}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Back to Dashboard
            </Link>
            <span className="hidden text-sm text-zinc-300 sm:inline" aria-hidden="true">
              /
            </span>
            <p className="text-base/6 text-zinc-500 sm:text-sm/6">
              Continue when the signer is ready.
            </p>
          </div>

          <Link
            href={`/sessions/${session.id}/sign`}
            className={buttonVariants({ size: "sm" })}
          >
            Start Session
          </Link>
        </div>
      </section>
    )
  }

  if (!presignToken) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <Loader2 className="size-4 shrink-0 animate-spin stroke-zinc-400" />
        <p className="text-base/6 text-zinc-500 sm:text-sm/6">
          Loading document editor...
        </p>
      </div>
    )
  }

  if (isPreparingSession) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <Loader2 className="size-4 shrink-0 animate-spin stroke-zinc-400" />
        <p className="text-base/6 text-zinc-500 sm:text-sm/6">
          Sending document for signing...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="max-w-[56ch] text-base/7 text-pretty text-zinc-500 sm:text-sm/6">
          Upload a document for {session.clientName}, add the signer, place
          fields, and save when ready.
        </p>
        <p className="max-w-[56ch] text-base/7 text-pretty text-zinc-500 sm:text-sm/6">
          Need a sample file? Download the{" "}
        <a
          href="/power-of-attorney-sample.pdf"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-zinc-950 underline underline-offset-4"
        >
          sample Power of Attorney PDF
        </a>
          {" "}and upload it into authoring.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-950/5">
        {envelopeId ? (
          <EmbedUpdateEnvelope
            className="h-[75dvh] w-full"
            envelopeId={envelopeId}
            externalId={session.id}
            host={host}
            presignToken={presignToken}
            onEnvelopeUpdated={handleEnvelopeUpdated}
          />
        ) : (
          <EmbedCreateEnvelope
            className="h-[75dvh] w-full"
            externalId={session.id}
            host={host}
            presignToken={presignToken}
            type="DOCUMENT"
            onEnvelopeCreated={handleEnvelopeCreated}
          />
        )}
      </div>
    </div>
  )
}
