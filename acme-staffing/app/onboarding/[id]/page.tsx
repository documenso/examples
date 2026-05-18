"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EmbedSignDocument } from "@documenso/embed-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import {
  readOnboardingState,
  saveOnboardingState,
  updatePlacementStatus,
  type DocStatus,
  type OnboardingData,
} from "@/hooks/use-placement-demo-state"
import { Progress } from "@/components/ui/progress"

const DOCUMENTS = [
  { key: "contractor" as const, label: "Contractor Agreement" },
  { key: "background" as const, label: "Background Check Consent" },
]

const DEFAULT_DOC_STATUSES: Record<"contractor" | "background", DocStatus> = {
  contractor: "pending",
  background: "pending",
}

export default function OnboardingPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<OnboardingData | null>(null)
  const [docStatuses, setDocStatuses] = useState<
    Record<"contractor" | "background", DocStatus>
  >(DEFAULT_DOC_STATUSES)
  const [signingTokens, setSigningTokens] = useState<Record<string, string>>(
    {},
  )
  const [loading, setLoading] = useState<"contractor" | "background" | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedState = readOnboardingState(params.id)

    if (storedState) {
      setData(storedState.data)
      setDocStatuses(storedState.docStatuses)
    }
  }, [params.id])

  useEffect(() => {
    if (!data) {
      return
    }

    saveOnboardingState(params.id, data, docStatuses)
  }, [data, docStatuses, params.id])

  const generateDocument = useCallback(
    async (documentType: "contractor" | "background") => {
      if (!data) return
      setLoading(documentType)
      setError(null)

      try {
        const response = await fetch("/api/generate-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.candidateName,
            email: data.email,
            clientCompany: data.clientCompany,
            role: data.role,
            startDate: data.startDate,
            hourlyRate: data.hourlyRate,
            documentType,
          }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || "Failed to generate document")
        }

        const result = await response.json()
        setSigningTokens((prev) => ({
          ...prev,
          [documentType]: result.signingToken,
        }))
        setDocStatuses((prev) => ({ ...prev, [documentType]: "signing" }))
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate document",
        )
      } finally {
        setLoading(null)
      }
    },
    [data],
  )

  const completedCount = Object.values(docStatuses).filter(
    (s) => s === "completed",
  ).length
  const allCompleted = completedCount === DOCUMENTS.length

  useEffect(() => {
    if (!allCompleted) {
      return
    }

    updatePlacementStatus(params.id, "ready_to_start")
  }, [allCompleted, params.id])

  if (!data) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            No onboarding data
          </h1>
          <p className="mx-auto mt-3 max-w-[42ch] text-base text-muted-foreground text-pretty">
            Please start the onboarding process from the placement detail
            page.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <ArrowLeft className="size-4 shrink-0" />
              Back to placements
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <PageShell>
      <div className="pb-8">
        <Link
          href={`/placements/${params.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to placement
        </Link>
      </div>

      <section className="border-b border-border/70 pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="max-w-[18ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Onboarding documents
            </h1>
            <p className="max-w-[56ch] text-base text-muted-foreground text-pretty">
              Send, sign, and complete the required documents for{" "}
              {data.candidateName}&apos;s {data.role} placement at{" "}
              {data.clientCompany}.
            </p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-border/70 bg-card p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                  {completedCount} / {DOCUMENTS.length}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {allCompleted ? "Ready to start" : "In progress"}
              </p>
            </div>
            <Progress
              value={(completedCount / DOCUMENTS.length) * 100}
              className="mt-4 h-2"
            />
          </div>
        </div>

        <dl className="mt-8 grid gap-x-10 gap-y-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-medium text-foreground">Candidate</dt>
            <dd className="mt-1 text-muted-foreground">{data.candidateName}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Client</dt>
            <dd className="mt-1 text-muted-foreground">{data.clientCompany}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Start date</dt>
            <dd className="mt-1 text-muted-foreground tabular-nums">
              {data.startDate}
            </dd>
          </div>
        </dl>
      </section>

      {allCompleted && (
        <section className="mt-8 rounded-3xl border border-border/70 bg-card p-6">
          <p className="text-sm font-medium text-foreground">All set</p>
          <p className="mt-2 max-w-[56ch] text-sm text-muted-foreground text-pretty">
            Every document is complete. {data.candidateName} can now move back
            into the placement queue as ready to start.
          </p>
          <div className="mt-5">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/")}
            >
              Return to placements
            </Button>
          </div>
        </section>
      )}

      {error && (
        <section className="mt-8 rounded-3xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </section>
      )}

      <section className="pt-8">
        <div className="flex flex-col gap-2 pb-6">
          <h2 className="text-lg font-semibold">Required documents</h2>
          <p className="max-w-[54ch] text-sm text-muted-foreground text-pretty">
            Both documents are available right away, so you can open whichever
            one you want to sign first. Each document opens directly in the
            embedded Documenso signer below.
          </p>
        </div>

        <ol role="list" className="space-y-8">
          {DOCUMENTS.map((doc, index) => {
            const status = docStatuses[doc.key]
            const isSigning = status === "signing"

            return (
              <li key={doc.key} className="border-t border-border/70 pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground tabular-nums">
                      Step {index + 1}
                    </p>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold tracking-tight text-balance">
                        {doc.label}
                      </h3>
                      <p className="max-w-[56ch] text-sm text-muted-foreground text-pretty">
                        {doc.key === "contractor"
                          ? "Confirm the placement terms, rate, and start date before sending the candidate into the second step."
                          : "Finish the authorization required to clear onboarding and mark the placement as ready to start."}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full max-w-xs flex-col items-start gap-3 lg:items-end">
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className={[
                          "size-2 rounded-full",
                          status === "completed"
                            ? "bg-primary"
                            : isSigning
                              ? "bg-primary"
                              : "bg-muted-foreground/45",
                        ].join(" ")}
                      />
                      {status === "completed"
                        ? "Completed"
                        : isSigning
                          ? "Signing in progress"
                          : "Ready to sign"}
                    </span>

                    {status === "pending" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => generateDocument(doc.key)}
                        disabled={loading !== null}
                      >
                        {loading === doc.key ? "Preparing…" : "Sign now"}
                      </Button>
                    )}
                  </div>
                </div>

                {isSigning && signingTokens[doc.key] && (
                  <div className="mt-5 overflow-hidden rounded-3xl border border-border/70 bg-background">
                    <EmbedSignDocument
                      token={signingTokens[doc.key]}
                      host={
                        process.env.NEXT_PUBLIC_DOCUMENSO_HOST ||
                        "https://app.documenso.com"
                      }
                      onDocumentCompleted={() => {
                        setDocStatuses((prev) => ({
                          ...prev,
                          [doc.key]: "completed",
                        }))
                        setSigningTokens((prev) => {
                          const nextTokens = { ...prev }
                          delete nextTokens[doc.key]
                          return nextTokens
                        })
                      }}
                      onDocumentReady={() => {}}
                      onDocumentError={(err) =>
                        console.error("Signing error:", err)
                      }
                      className="h-[600px] w-full"
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </section>
    </PageShell>
  )
}
