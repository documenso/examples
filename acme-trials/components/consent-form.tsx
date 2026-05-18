"use client"

import { useState } from "react"
import { EmbedSignDocument } from "@documenso/embed-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileSignature, Loader2, RefreshCcw } from "lucide-react"
import type { Participant } from "@/lib/mock-data"
import { STUDY } from "@/lib/mock-data"
import type { ParticipantConsentRecord } from "@/lib/participant-consents"
import { useParticipantConsents } from "@/hooks/use-participant-consents"

type GeneratedEnvelope = {
  signingToken: string
  envelopeId: string
  documentId: number | null
  email: string
}

type ConsentState =
  | { step: "form" }
  | { step: "creating" }
  | { step: "signing"; session: GeneratedEnvelope }
  | { step: "syncing"; session: GeneratedEnvelope }
  | { step: "error"; message: string; session?: GeneratedEnvelope }

type ConsentStatusResponse = {
  envelopeId: string
  consentedAt: string
  signedAt: string | null
  signer: {
    email: string
    signingStatus: string
  }
}

export function ConsentForm({ participant }: { participant: Participant }) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<ConsentState>({ step: "form" })
  const { upsertConsent } = useParticipantConsents()

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  async function syncCompletedConsent(
    session: GeneratedEnvelope,
    completedDocumentId?: number | null,
  ) {
    setState({ step: "syncing", session })

    try {
      const response = await fetch(
        `/api/participants/${participant.id}/consent-status?envelopeId=${encodeURIComponent(session.envelopeId)}`,
      )

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? "Failed to verify consent completion")
      }

      const payload = (await response.json()) as ConsentStatusResponse

      if (!payload.signedAt || payload.signer.signingStatus !== "SIGNED") {
        throw new Error(
          "Documenso has not recorded the signer completion yet. Retry sync in a moment.",
        )
      }

      const consentRecord: ParticipantConsentRecord = {
        participantId: participant.id,
        envelopeId: payload.envelopeId,
        documentId: completedDocumentId ?? session.documentId,
        email: payload.signer.email || session.email,
        consentedAt: payload.consentedAt,
        signedAt: payload.signedAt,
      }

      upsertConsent(consentRecord)
      setState({ step: "form" })
    } catch (error) {
      setState({
        step: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to sync completed consent",
        session,
      })
    }
  }

  async function handleSendICF() {
    if (!email.trim()) return

    setState({ step: "creating" })

    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName: participant.name,
          email,
          studyId: STUDY.id,
          protocolVersion: participant.protocolVersion,
          siteName: participant.site,
          studyTitle: STUDY.title,
          protocolNumber: participant.protocolVersion,
          sponsor: STUDY.sponsor,
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        setState({
          step: "error",
          message: data?.error || "Request failed",
        })
        return
      }

      const data = (await res.json()) as {
        signingToken: string
        envelopeId: string
        documentId: number | null
      }

      setState({
        step: "signing",
        session: {
          signingToken: data.signingToken,
          envelopeId: data.envelopeId,
          documentId: data.documentId,
          email,
        },
      })
    } catch {
      setState({
        step: "error",
        message: "Network error. Please try again.",
      })
    }
  }

  if (state.step === "syncing") {
    return (
      <section className="flex items-center gap-3 border-t border-border py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 shrink-0 animate-spin stroke-emerald-600" />
        Verifying completion with Documenso and updating participant status…
      </section>
    )
  }

  if (state.step === "signing") {
    return (
      <section className="space-y-5 border-t border-border pt-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-base font-medium">
            <FileSignature className="size-4 shrink-0 stroke-primary" />
            <h2>Informed consent form — {STUDY.id}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {participant.name} · Protocol {participant.protocolVersion}
          </p>
        </div>
        <div className="rounded-lg border border-border">
          <div className="border-b border-border px-5 py-4 text-sm text-muted-foreground">
            Participant name, study ID, protocol version, and site name were
            injected server-side from the live Documenso template before the
            signing session opened.
          </div>
          <div className="p-2">
            <EmbedSignDocument
              token={state.session.signingToken}
              host={host}
              darkModeDisabled
              onDocumentCompleted={(data) =>
                syncCompletedConsent(state.session, data.documentId)
              }
              className="h-[720px] w-full"
            />
          </div>
        </div>
      </section>
    )
  }

  const recoverableSession =
    state.step === "error" ? state.session : undefined

  return (
    <section className="space-y-5 border-t border-border pt-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-base font-medium">
          <FileSignature className="size-4 shrink-0 stroke-primary" />
          <h2>Collect informed consent</h2>
        </div>
        <p className="max-w-[70ch] text-sm text-pretty text-muted-foreground">
          Generate the ICF from the live Documenso template, pre-fill
          participant and study metadata, then capture the participant
          signature inline.
        </p>
      </div>

      {state.step === "error" && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p>{state.message}</p>
          {recoverableSession ? (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => syncCompletedConsent(recoverableSession)}
              className="mt-3"
            >
              <RefreshCcw className="size-4 shrink-0" />
              Retry status sync
            </Button>
          ) : null}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-end">
        <div className="space-y-2">
          <Label htmlFor="email">Participant email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            className="w-full max-w-xs"
            placeholder="participant@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Pre-filled template values: participant name, study ID, protocol
          version, and site name.
        </div>
      </div>

      <Button
        type="button"
        onClick={handleSendICF}
        disabled={!email.trim() || state.step === "creating"}
      >
        {state.step === "creating" ? (
          <>
            <Loader2 className="size-4 shrink-0 animate-spin" />
            Preparing ICF…
          </>
        ) : (
          "Generate ICF"
        )}
      </Button>
    </section>
  )
}