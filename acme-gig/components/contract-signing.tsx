"use client"

import { useCallback, useEffect, useState } from "react"
import { EmbedSignDocument } from "@documenso/embed-react"

interface GigSession {
  id: string
  clientName: string
  creatorName: string
  deliverables: string
  deadline: string
  budget: string
  usageRights: string
  clientSigned: boolean
  creatorSigned: boolean
  status: "PENDING_CLIENT" | "PENDING_CREATOR" | "COMPLETED" | "REJECTED"
  step: "client-sign" | "creator-pending" | "complete" | "rejected"
  activeSigner: "client" | "creator" | null
  activeToken: string | null
  completedAt: string | null
}

const secondaryButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-lg px-4 text-base font-medium text-zinc-700 ring-1 ring-zinc-950/10 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 sm:px-3 sm:text-sm dark:text-zinc-200 dark:ring-white/10"

export function ContractSigning({ contractId }: { contractId: string }) {
  const [session, setSession] = useState<GigSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [showCreatorEmbed, setShowCreatorEmbed] = useState(false)

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/contract/${contractId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Contract not found")
      }

      const nextSession = data as GigSession
      setSession(nextSession)

      if (nextSession.step !== "creator-pending") {
        setShowCreatorEmbed(false)
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contract")
    } finally {
      setLoading(false)
    }
  }, [contractId])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  async function syncSigningState() {
    setSyncing(true)

    try {
      const res = await fetch(`/api/contract/${contractId}/complete`, {
        method: "POST",
      })
      const data: GigSession = await res.json()

      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error ?? "Failed to sync contract"
        )
      }

      setSession(data)
      setError(null)

      if (data.step !== "creator-pending") {
        setShowCreatorEmbed(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync contract")
    } finally {
      setSyncing(false)
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14 lg:px-8">
        <div className="max-w-[36rem] border-t border-zinc-950/10 pt-6 dark:border-white/10">
          <p className="text-base/7 text-red-600 sm:text-sm/6 dark:text-red-400">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (loading || !session) {
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-center px-6 py-24 lg:px-8">
        <div className="size-8 animate-spin rounded-full border-2 border-zinc-950/15 border-t-zinc-950 dark:border-white/15 dark:border-t-white" />
      </div>
    )
  }

  const creatorEmbedVisible = Boolean(
    session.step === "creator-pending" &&
    showCreatorEmbed &&
    session.activeSigner === "creator" &&
    session.activeToken
  )

  const clientEmbedVisible = Boolean(
    session.step === "client-sign" &&
    session.activeSigner === "client" &&
    session.activeToken
  )

  const deadlineLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(session.deadline))

  const completedLabel = session.completedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(session.completedAt))
    : null

  const steps = [
    {
      label: session.clientName,
      description: "Client signature",
      done: session.clientSigned,
      active: session.step === "client-sign",
    },
    {
      label: session.creatorName,
      description: "Creator countersign",
      done: session.creatorSigned,
      active: session.step === "creator-pending",
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14 lg:px-8">
      <div className="flex flex-col gap-10 sm:gap-12">
        <section className="flex flex-col gap-5 border-b border-zinc-950/8 pb-10 dark:border-white/10">
          <p className="text-base/7 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
            Service agreement.
          </p>
          <div className="flex flex-col gap-3">
            <h1 className="max-w-[16ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Contract review and signatures.
            </h1>
            <p className="max-w-[56ch] text-base/7 text-pretty text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
              Between {session.clientName} and {session.creatorName}. Review the
              scope, then complete the signing flow in Documenso.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {steps.map((step, index) => (
              <div
                key={step.description}
                className="flex min-w-0 flex-1 items-center gap-4"
              >
                <div
                  className={`size-3 shrink-0 rounded-full ${
                    step.done
                      ? "bg-zinc-950 dark:bg-white"
                      : step.active
                        ? "bg-blue-600"
                        : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-950 dark:text-white">
                    {step.label}
                  </p>
                  <p className="text-base/7 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 ? (
                  <div className="hidden h-px flex-1 bg-zinc-950/10 sm:block dark:bg-white/10" />
                ) : null}
              </div>
            ))}
          </div>

          <dl className="divide-y divide-zinc-950/5 border-y border-zinc-950/8 dark:divide-white/10 dark:border-white/10">
            <div className="grid gap-2 py-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6">
              <dt className="font-medium text-zinc-950 dark:text-white">
                Deliverables
              </dt>
              <dd className="text-base/7 text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
                {session.deliverables}
              </dd>
            </div>
            <div className="grid gap-2 py-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6">
              <dt className="font-medium text-zinc-950 dark:text-white">
                Deadline
              </dt>
              <dd className="text-base/7 text-zinc-600 tabular-nums sm:text-sm/6 dark:text-zinc-400">
                {deadlineLabel}
              </dd>
            </div>
            <div className="grid gap-2 py-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6">
              <dt className="font-medium text-zinc-950 dark:text-white">
                Budget
              </dt>
              <dd className="text-base/7 text-zinc-600 tabular-nums sm:text-sm/6 dark:text-zinc-400">
                ${Number(session.budget).toLocaleString()}
              </dd>
            </div>
            <div className="grid gap-2 py-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6">
              <dt className="font-medium text-zinc-950 dark:text-white">
                Usage rights
              </dt>
              <dd className="text-base/7 text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
                {session.usageRights}
              </dd>
            </div>
          </dl>
        </section>

        {clientEmbedVisible ? (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-zinc-950 dark:text-white">
                Client signature in progress.
              </p>
              <p className="text-base/7 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                {session.clientName} is the active signer for this step.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg ring-1 ring-zinc-950/10 dark:ring-white/10">
              <EmbedSignDocument
                token={session.activeToken!}
                host={host}
                onDocumentCompleted={syncSigningState}
                className="h-[640px] w-full"
              />
            </div>
          </section>
        ) : null}

        {session.step === "creator-pending" && !creatorEmbedVisible ? (
          <section className="flex flex-col gap-4 border-t border-zinc-950/8 pt-8 dark:border-white/10">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-zinc-950 dark:text-white">
                Client signature complete.
              </p>
              <p className="max-w-[48ch] text-base/7 text-pretty text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
                Waiting for {session.creatorName} to countersign. Use the demo
                action below to continue the flow.
              </p>
            </div>
            <div>
              <button
                type="button"
                disabled={syncing || !session.activeToken}
                onClick={() => setShowCreatorEmbed(true)}
                className={secondaryButtonClassName}
              >
                {syncing ? "Refreshing status..." : "Sign as creator"}
              </button>
            </div>
          </section>
        ) : null}

        {creatorEmbedVisible ? (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-zinc-950 dark:text-white">
                Creator countersign in progress.
              </p>
              <p className="text-base/7 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                {session.creatorName} is the active signer for this step.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg ring-1 ring-zinc-950/10 dark:ring-white/10">
              <EmbedSignDocument
                token={session.activeToken!}
                host={host}
                onDocumentCompleted={syncSigningState}
                className="h-[640px] w-full"
              />
            </div>
          </section>
        ) : null}

        {session.step === "complete" ? (
          <section className="flex flex-col gap-6 border-t border-zinc-950/8 pt-8 dark:border-white/10">
            <div className="flex flex-col gap-2">
              <h2 className="max-w-[18ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Agreement countersigned.
              </h2>
              <p className="max-w-[48ch] text-base/7 text-pretty text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
                Both signatures are complete and the project can move into
                scheduling and production.
              </p>
            </div>
            <dl className="divide-y divide-zinc-950/5 border-y border-zinc-950/8 dark:divide-white/10 dark:border-white/10">
              <div className="grid gap-2 py-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6">
                <dt className="font-medium text-zinc-950 dark:text-white">
                  Client
                </dt>
                <dd className="text-base/7 text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
                  {session.clientName}
                </dd>
              </div>
              <div className="grid gap-2 py-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6">
                <dt className="font-medium text-zinc-950 dark:text-white">
                  Creator
                </dt>
                <dd className="text-base/7 text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
                  {session.creatorName}
                </dd>
              </div>
              {completedLabel ? (
                <div className="grid gap-2 py-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6">
                  <dt className="font-medium text-zinc-950 dark:text-white">
                    Signed on
                  </dt>
                  <dd className="text-base/7 text-zinc-600 tabular-nums sm:text-sm/6 dark:text-zinc-400">
                    {completedLabel}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : null}

        {session.step === "rejected" ? (
          <section className="flex flex-col gap-2 border-t border-zinc-950/8 pt-8 dark:border-white/10">
            <h2 className="text-3xl font-semibold tracking-tight text-balance text-red-600 sm:text-4xl dark:text-red-400">
              Agreement rejected.
            </h2>
            <p className="max-w-[48ch] text-base/7 text-pretty text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
              This contract was rejected in Documenso and is no longer active.
            </p>
          </section>
        ) : null}
      </div>
    </div>
  )
}
