"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import {
  ArrowLeft,
  ClipboardList,
  ExternalLink,
  FileClock,
  Loader2,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import type { Participant } from "@/lib/mock-data"
import { STUDY } from "@/lib/mock-data"
import { formatParticipantConsentTimestamp } from "@/lib/participant-consents"
import { useParticipantConsents } from "@/hooks/use-participant-consents"

type AuditEntry = {
  id: string
  type: string
  createdAt: string
  summary: string
  actorName: string | null
  actorEmail: string | null
  ipAddress: string | null
}

type AuditResponse = {
  envelope: {
    id: string
    title: string
    status: string
    createdAt: string
    updatedAt: string
    completedAt: string | null
    recipients: Array<{
      id: number
      name: string
      email: string
      role: string
      signingStatus: string
      signedAt: string | null
    }>
  }
  audit: {
    entries: AuditEntry[]
    count: number
  }
}


export function ParticipantAudit({ participant }: { participant: Participant }) {
  const searchParams = useSearchParams()
  const { records } = useParticipantConsents()
  const storedRecord = records[participant.id]
  const envelopeId = searchParams.get("envelopeId") ?? storedRecord?.envelopeId ?? null
  const [state, setState] = React.useState<
    | { step: "idle" | "loading" }
    | { step: "ready"; data: AuditResponse }
    | { step: "error"; message: string }
  >({ step: envelopeId ? "loading" : "idle" })
  const readyData = state.step === "ready" ? state.data : null

  React.useEffect(() => {
    if (!envelopeId) {
      setState({ step: "idle" })
      return
    }

    const activeEnvelopeId = envelopeId
    let active = true

    async function loadAudit() {
      setState({ step: "loading" })

      try {
        const response = await fetch(
          `/api/participants/${participant.id}/audit?envelopeId=${encodeURIComponent(activeEnvelopeId)}`,
          { cache: "no-store" },
        )

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { error?: string }
            | null
          throw new Error(data?.error ?? "Failed to load audit trail")
        }

        const data = (await response.json()) as AuditResponse

        if (active) {
          setState({ step: "ready", data })
        }
      } catch (error) {
        if (active) {
          setState({
            step: "error",
            message:
              error instanceof Error ? error.message : "Failed to load audit trail",
          })
        }
      }
    }

    void loadAudit()

    return () => {
      active = false
    }
  }, [envelopeId, participant.id])

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-2">
        <Link
          href={`/participants/${participant.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to participant
        </Link>
      </div>

      <section className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Audit trail · {participant.id} · {STUDY.id}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {participant.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Review recipient events, timestamps, and envelope activity for the
            consent session.
          </p>
        </div>
        {envelopeId ? (
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Envelope ID:{" "}
            <span className="font-mono text-foreground tabular-nums">
              {envelopeId}
            </span>
          </div>
        ) : null}
      </section>

      {!envelopeId ? (
        <section className="space-y-4">
          <ClipboardList className="size-5 stroke-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium">No audit trail available yet</p>
            <p className="max-w-[65ch] text-sm text-muted-foreground">
              Generate and complete the consent form first. This demo stores the
              latest signed envelope in local browser storage because no database
              is configured.
            </p>
          </div>
          <Link
            href={`/participants/${participant.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Return to consent flow
          </Link>
        </section>
      ) : state.step === "loading" ? (
        <section className="flex items-center gap-3 border-t border-border py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 shrink-0 animate-spin" />
          Loading Documenso audit trail…
        </section>
      ) : state.step === "error" ? (
        <section className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-4">
          <p className="font-medium text-destructive">Unable to load audit trail</p>
          <p className="text-sm text-muted-foreground">{state.message}</p>
          <Link
            href={`/participants/${participant.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Back to participant
          </Link>
        </section>
      ) : readyData ? (
        <>
          <section className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
            <aside className="space-y-8 border-l border-border pl-6 lg:pl-8">
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <FileClock className="size-4 shrink-0 stroke-primary" />
                  <h2>Envelope summary</h2>
                </div>
                <SummaryRow label="Document title" value={readyData.envelope.title} />
                <SummaryRow label="Status" value={readyData.envelope.status} />
                <SummaryRow
                  label="Created"
                  value={formatParticipantConsentTimestamp(readyData.envelope.createdAt)}
                />
                <SummaryRow
                  label="Completed"
                  value={formatParticipantConsentTimestamp(readyData.envelope.completedAt)}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Recipients</p>
                <ul role="list" className="space-y-3">
                  {readyData.envelope.recipients.map((recipient) => (
                    <li key={recipient.id} className="space-y-1 text-sm">
                      <p className="font-medium">{recipient.name}</p>
                      <p className="text-muted-foreground">{recipient.email}</p>
                      <p className="text-muted-foreground tabular-nums">
                        {recipient.role} · {recipient.signingStatus} · Signed{" "}
                        {formatParticipantConsentTimestamp(recipient.signedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-balance">
                  Activity timeline
                </h2>
                <p className="text-sm text-muted-foreground">
                  Every event returned by Documenso for this envelope.
                </p>
              </div>

              <ol role="list" className="space-y-6 border-l border-border pl-6">
                {readyData.audit.entries.map((entry) => (
                  <li key={entry.id} className="relative -ml-[1.8125rem] pl-6">
                    <span className="absolute top-1.5 left-0 size-3 rounded-full border-2 border-background bg-primary" />
                    <div className="space-y-2">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium">{entry.summary}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatAuditEntryType(entry.type)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground tabular-nums">
                          {formatParticipantConsentTimestamp(entry.createdAt)}
                        </p>
                      </div>
                      {entry.actorName || entry.actorEmail || entry.ipAddress ? (
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {entry.actorName || entry.actorEmail ? (
                            <p>
                              Actor: {entry.actorName ?? "Unknown"}
                              {entry.actorEmail ? ` (${entry.actorEmail})` : ""}
                            </p>
                          ) : null}
                          {entry.ipAddress ? <p>IP address: {entry.ipAddress}</p> : null}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </section>

          <div className="flex justify-start border-t border-border pt-6">
            <Link
              href={`/participants/${participant.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Return to participant
              <ExternalLink className="size-4 shrink-0" />
            </Link>
          </div>
        </>
      ) : null
      }
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium text-pretty tabular-nums">{value}</p>
    </div>
  )
}

function formatAuditEntryType(value: string) {
  const sentence = value.toLowerCase().replaceAll("_", " ")
  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}
