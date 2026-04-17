"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { EmbedSignDocument } from "@documenso/embed-react"
import { Video, CheckCircle2, Loader2, Stamp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { NotarySession } from "@/lib/mock-data"
import { getStoredSessionState, updateStoredSessionState } from "@/lib/session-state"

interface VerificationCheck {
  label: string
  completed: boolean
}

export function SigningSession({ session }: { session: NotarySession }) {
  const [signingToken, setSigningToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sealed, setSealed] = useState(false)
  const [completedAt, setCompletedAt] = useState<string | null>(null)
  const [envelopeId, setEnvelopeId] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [checks, setChecks] = useState<VerificationCheck[]>([
    { label: "ID Verified", completed: false },
    { label: "Face Match", completed: false },
    { label: "Liveness Check", completed: false },
  ])

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  useEffect(() => {
    const storedSessionState = getStoredSessionState(session.id)

    if (!storedSessionState?.envelopeId) {
      setError("Prepare this session again to create an envelope before signing.")
      return
    }

    setEnvelopeId(storedSessionState.envelopeId)
    setSealed(storedSessionState.status === "completed")
    setCompletedAt(storedSessionState.completedAt ?? null)
    setSessionReady(true)
  }, [session.id])

  // Auto-complete identity verification checks
  useEffect(() => {
    if (!sessionReady) {
      return
    }

    const timers: NodeJS.Timeout[] = []
    checks.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setChecks((prev) =>
            prev.map((c, j) => (j === i ? { ...c, completed: true } : c))
          )
        }, 2000 + i * 800)
      )
    })
    return () => timers.forEach(clearTimeout)
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady])

  // Fetch signing token
  useEffect(() => {
    if (!envelopeId) {
      return
    }

    async function fetchToken() {
      try {
        const res = await fetch("/api/generate-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            envelopeId,
            email: session.clientEmail,
          }),
        })
        if (!res.ok) throw new Error("Failed to load the signing document")
        const data = await res.json()
        setSigningToken(data.signingToken)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }
    fetchToken()
  }, [envelopeId, session.clientEmail])

  const allChecksComplete = checks.every((c) => c.completed)

  const handleDocumentCompleted = useCallback(() => {
    const nextCompletedAt = new Date().toISOString()

    updateStoredSessionState(session.id, {
      status: "completed",
      completedAt: nextCompletedAt,
    })

    setCompletedAt(nextCompletedAt)
    setSealed(true)
  }, [session.id])

  return (
    <div className="flex min-h-[calc(100svh-129px)] flex-col lg:grid lg:grid-cols-[360px_1fr]">
      <section className="flex flex-col gap-8 border-b border-zinc-950/5 px-6 py-6 lg:border-r lg:border-b-0">
        <div className="space-y-3">
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-md bg-zinc-900">
            <Video className="size-4 shrink-0 stroke-zinc-500" />
            <div className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2">
              <p className="text-sm font-medium text-white">
                {session.clientName}
              </p>
            </div>
          </div>
          <p className="text-base/7 text-pretty text-zinc-500 sm:text-sm/6">
            Complete the identity review, then finish the signature inside the
            document viewer.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-medium text-zinc-950 sm:text-sm">
            Identity review
          </h2>
          <dl role="list" className="divide-y divide-zinc-950/5">
            {checks.map((check) => (
              <div key={check.label} className="flex items-start gap-3 py-3">
                <span
                  className={cn(
                    "mt-2 size-1.5 shrink-0 rounded-full",
                    check.completed ? "bg-emerald-500" : "bg-amber-500"
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 space-y-1">
                  <dt className="text-base/6 font-medium text-zinc-950 sm:text-sm/6">
                    {check.label}
                  </dt>
                  <dd className="text-base/6 text-zinc-500 sm:text-sm/6">
                    {check.completed ? "Complete." : "In progress."}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {allChecksComplete && (
            <p className="flex items-center gap-2 text-base/6 text-emerald-600 sm:text-sm/6">
              <CheckCircle2 className="size-4 shrink-0 stroke-emerald-600" />
              Identity verified.
            </p>
          )}
        </div>

        {sealed && (
          <div className="mt-auto animate-in fade-in duration-500 border-t border-zinc-950/5 pt-4">
            <div className="flex items-start gap-2">
              <Stamp className="size-4 shrink-0 stroke-zinc-950" />
              <div className="space-y-1">
                <p className="text-base/6 font-medium text-zinc-950 sm:text-sm/6">
                  Notary seal applied
                </p>
                <p className="text-sm tabular-nums text-zinc-500">
                  {completedAt
                    ? new Date(completedAt).toLocaleString()
                    : new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="min-h-0">
        {error ? (
          <div className="flex h-full items-center justify-center px-6 py-12">
            <Alert
              variant="destructive"
              className="max-w-md rounded-lg border-zinc-950/10"
            >
              <AlertTitle>Session unavailable</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{error}</p>
                <Link
                  href={`/sessions/${session.id}/prepare`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Prepare Session
                </Link>
              </AlertDescription>
            </Alert>
          </div>
        ) : sealed ? (
          <div className="flex h-full items-center px-6 py-16">
            <div className="w-full space-y-10">
              <div className="space-y-4">
                <p className="text-base/6 font-medium text-zinc-500 sm:text-sm/6">
                  Session completed.
                </p>
                <div className="space-y-3">
                  <h2 className="max-w-[16ch] text-4xl font-semibold tracking-tight text-balance text-zinc-950">
                    Signed and sealed.
                  </h2>
                  <p className="max-w-[56ch] text-base/7 text-pretty text-zinc-500 sm:text-sm/6">
                    The {session.documentType.toLowerCase()} for{" "}
                    {session.clientName} has been completed and sealed by the
                    notary.
                  </p>
                </div>
              </div>

              <dl
                role="list"
                className="grid gap-0 border-t border-zinc-950/5 pt-6 sm:grid-cols-2"
              >
                <div className="space-y-1 pb-4 sm:pr-8 sm:pb-0">
                  <dt className="text-sm font-medium text-zinc-950">
                    Signer
                  </dt>
                  <dd className="text-base/7 text-zinc-500 sm:text-sm/6">
                    {session.clientName}
                  </dd>
                </div>
                <div className="space-y-1 border-t border-zinc-950/5 pt-4 sm:border-t-0 sm:border-l sm:border-zinc-950/5 sm:pl-8 sm:pt-0">
                  <dt className="text-sm font-medium text-zinc-950">
                    Completed
                  </dt>
                  <dd className="text-base/7 tabular-nums text-zinc-500 sm:text-sm/6">
                    {completedAt
                      ? new Date(completedAt).toLocaleString()
                      : new Date().toLocaleString()}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/" className={buttonVariants({ size: "sm" })}>
                  Return to Sessions
                </Link>
                <Link
                  href={`/sessions/${session.id}/prepare`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Review document
                </Link>
              </div>
            </div>
          </div>
        ) : !signingToken ? (
          <div className="flex h-full items-center justify-center gap-2 px-6 py-12">
            <Loader2 className="size-4 shrink-0 animate-spin stroke-zinc-400" />
            <p className="text-base/6 text-zinc-500 sm:text-sm/6">
              Loading document...
            </p>
          </div>
        ) : (
          <div className="h-full lg:border-l lg:border-zinc-950/5">
            <EmbedSignDocument
              token={signingToken}
              host={host}
              onDocumentCompleted={handleDocumentCompleted}
              className="h-full min-h-[70dvh] w-full flex-1"
            />
          </div>
        )}
      </section>
    </div>
  )
}
