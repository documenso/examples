"use client"

import { use, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, FileText, Loader2, Lock } from "lucide-react"
import { EmbedSignDocument } from "@documenso/embed-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type DocKey = "ima" | "fee" | "adv"

interface ClientSession {
  id: string
  prospectId: string
  clientName: string
  email: string
  aum: string
  fee: string
  pipelineStage: string
  imaToken: string | null
  imaSigned: boolean
  feeToken: string | null
  feeSigned: boolean
  advToken: string | null
  advSigned: boolean
}

const docs: { key: DocKey; label: string; description: string }[] = [
  {
    key: "ima",
    label: "Investment Management Agreement",
    description: "Authorizes Meridian Wealth Advisors to manage the portfolio.",
  },
  {
    key: "fee",
    label: "Fee Acknowledgment",
    description: "Confirms the agreed advisory fee and billing schedule.",
  },
  {
    key: "adv",
    label: "ADV Part 2 Disclosure",
    description: "Reviews the firm brochure and required disclosures.",
  },
]

function getToken(session: ClientSession, key: DocKey): string | null {
  const tokenMap: Record<DocKey, string | null> = {
    ima: session.imaToken,
    fee: session.feeToken,
    adv: session.advToken,
  }

  return tokenMap[key]
}

function isSigned(session: ClientSession, key: DocKey): boolean {
  const signedMap: Record<DocKey, boolean> = {
    ima: session.imaSigned,
    fee: session.feeSigned,
    adv: session.advSigned,
  }

  return signedMap[key]
}

function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("error" in payload)) {
    return null
  }

  return typeof payload.error === "string" ? payload.error : null
}

function isClientSession(payload: unknown): payload is ClientSession {
  if (!payload || typeof payload !== "object") {
    return false
  }

  return (
    "id" in payload &&
    "clientName" in payload &&
    "email" in payload &&
    "imaSigned" in payload &&
    "feeSigned" in payload &&
    "advSigned" in payload
  )
}

function getStatusLabel(status: "signed" | "active" | "locked") {
  if (status === "signed") {
    return "Signed"
  }

  if (status === "active") {
    return "Ready now"
  }

  return "Locked"
}

export default function OnboardingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [session, setSession] = useState<ClientSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDoc, setActiveDoc] = useState<DocKey | null>(null)
  const [completing, setCompleting] = useState(false)

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/clients/${id}`)
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | ClientSession
        | null
      const errorMessage = getErrorMessage(payload)

      if (!response.ok || !isClientSession(payload) || errorMessage) {
        throw new Error(errorMessage || "Failed to fetch onboarding session")
      }

      setSession(payload)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch onboarding session"
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const signedCount = session
    ? [session.imaSigned, session.feeSigned, session.advSigned].filter(Boolean)
        .length
    : 0

  const progressPercent = (signedCount / docs.length) * 100
  const allSigned = signedCount === docs.length

  function getDocStatus(
    key: DocKey,
    index: number
  ): "signed" | "active" | "locked" {
    if (!session) {
      return "locked"
    }

    if (isSigned(session, key)) {
      return "signed"
    }

    const previousKeys = docs.slice(0, index).map((doc) => doc.key)
    const allPreviousSigned = previousKeys.every((previousKey) =>
      isSigned(session, previousKey)
    )

    return allPreviousSigned ? "active" : "locked"
  }

  async function handleDocumentCompleted(key: DocKey) {
    setCompleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/clients/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: key }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | { success: boolean }
        | null
      const errorMessage = getErrorMessage(payload)

      if (!response.ok || !payload || errorMessage) {
        throw new Error(errorMessage || "Failed to mark document complete")
      }

      setActiveDoc(null)
      await fetchSession()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark document complete"
      )
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Session not found</p>
          <Link href="/">
            <Button variant="outline">Back to Pipeline</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="isolate min-h-dvh bg-background">
      <AppHeader
        subtitle="Document signing"
        meta="Sequential advisory packet"
        containerClassName="max-w-6xl"
      />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to advisory pipeline
        </Link>

        <section className="border-b border-border/70 pb-8">
          <div className="grid gap-8 lg:grid-cols-[11fr_5fr] lg:items-end">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Live onboarding session
              </p>
              <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance">
                {session.clientName}
              </h1>
              <p className="max-w-[56ch] text-base text-pretty text-muted-foreground">
                {session.email} is signing the Meridian advisory packet. Each
                document unlocks the next one in sequence.
              </p>
            </div>

            <div className="border-t border-border/70 pt-4 lg:pt-0 lg:pl-8">
              <p className="text-sm text-muted-foreground">Household profile</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">
                {session.aum}
              </p>
              <p className="mt-2 text-sm text-muted-foreground tabular-nums">
                Advisory fee {session.fee}
              </p>
            </div>
          </div>
        </section>

        <section className="grid border-b border-border/70 py-6 sm:grid-cols-3">
          {[
            {
              label: "Progress",
              value: `${signedCount}/${docs.length}`,
              detail: "Documents complete in this packet",
            },
            {
              label: "Current status",
              value: allSigned
                ? "Finished"
                : completing
                  ? "Finalizing"
                  : "In flight",
              detail: allSigned
                ? "Packet complete and ready to close"
                : "One document can be signed at a time",
            },
            {
              label: "Next step",
              value: allSigned ? "Return to pipeline" : "Continue sequence",
              detail: allSigned
                ? "The household will be marked active"
                : "Complete the current document to unlock the next one",
            },
          ].map((item, index) => (
            <div
              key={item.label}
              className={[
                "py-4",
                index > 0
                  ? "border-t border-border/70 sm:border-t-0 sm:border-l"
                  : "",
                index === 0 ? "sm:pr-6" : "",
                index === 1 ? "sm:px-6" : "",
                index === 2 ? "sm:pl-6" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <p className="truncate text-sm text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </section>

        <section className="py-8">
          <div className="flex flex-col gap-3 border-b border-border/70 pb-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-balance">
                Packet sequence
              </h2>
              <p className="text-sm text-muted-foreground tabular-nums">
                {signedCount}/{docs.length} signed
              </p>
            </div>
            <Progress value={progressPercent} className="h-2" />
            {allSigned ? (
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                All documents are complete and this household is ready to move
                into active service.
              </div>
            ) : completing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 shrink-0 animate-spin" />
                Finalizing the signed document and refreshing the packet.
              </div>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="border-b border-border/70">
            {docs.map((doc, index) => {
              const status = getDocStatus(doc.key, index)
              const token = getToken(session, doc.key)
              const canLaunchSigner = status === "active" && Boolean(token)

              return (
                <article
                  key={doc.key}
                  className="border-t border-border/70 py-6 first:border-t-0"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-muted-foreground">
                        Document {index + 1}
                      </p>
                      <h3 className="text-xl font-semibold tracking-tight text-balance">
                        {doc.label}
                      </h3>
                      <p className="max-w-[56ch] text-base text-pretty text-muted-foreground">
                        {doc.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getStatusLabel(status)}
                        {status === "locked"
                          ? " — this document unlocks after the previous signature."
                          : status === "signed"
                            ? " — signature recorded."
                            : " — ready for the current signer."}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {status === "signed" ? (
                        <p className="text-sm font-medium text-foreground">
                          Signed
                        </p>
                      ) : status === "active" ? (
                        activeDoc === doc.key ? (
                          <p className="text-sm font-medium text-foreground">
                            {completing ? "Finalizing" : "Signing"}
                          </p>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!canLaunchSigner || completing}
                            onClick={() => setActiveDoc(doc.key)}
                          >
                            <FileText className="mr-1 size-4 shrink-0" />
                            {canLaunchSigner
                              ? "Open signer"
                              : "Token unavailable"}
                          </Button>
                        )
                      ) : (
                        <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Lock className="size-4 shrink-0" />
                          Locked
                        </p>
                      )}
                    </div>
                  </div>

                  {activeDoc === doc.key && token ? (
                    <div className="mt-6 overflow-hidden rounded-xl border border-border/70">
                      <EmbedSignDocument
                        token={token}
                        host={host}
                        onDocumentCompleted={() =>
                          handleDocumentCompleted(doc.key)
                        }
                        className="h-[600px] w-full"
                      />
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>

        {allSigned ? (
          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                Return to Pipeline
              </Button>
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  )
}
