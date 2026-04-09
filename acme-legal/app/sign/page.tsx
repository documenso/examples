"use client"

import { useEffect, useState } from "react"
import { EmbedSignDocument } from "@documenso/embed-react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AppHeader } from "@/components/app-header"
import {
  FIRM_NAME,
  INTAKE_STORAGE_KEY,
  type IntakePayload,
} from "@/lib/acme-legal"
import { RETAINER_AMOUNTS } from "@/lib/mock-data"

export default function SignPage() {
  const [intake, setIntake] = useState<IntakePayload | null>(null)
  const [signingToken, setSigningToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  useEffect(() => {
    async function generateDocument() {
      try {
        const rawIntake = sessionStorage.getItem(INTAKE_STORAGE_KEY)

        if (!rawIntake) {
          throw new Error(
            "Missing required information. Please complete the intake form."
          )
        }

        const parsedIntake = JSON.parse(rawIntake) as IntakePayload
        setIntake(parsedIntake)

        const response = await fetch("/api/generate-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedIntake),
        })

        if (!response.ok) {
          throw new Error("Failed to generate engagement letter")
        }

        const data = await response.json()
        setSigningToken(data.signingToken)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    generateDocument()
  }, [])

  if (completed && intake) {
    const retainer = RETAINER_AMOUNTS[intake.matterType]

    return (
      <main className="min-h-dvh bg-background">
        <AppHeader />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <HugeiconsIcon
            icon={Tick02Icon}
            strokeWidth={2}
            className="size-4 shrink-0 text-primary"
          />
          <h1 className="mt-4 max-w-[24ch] text-2xl font-semibold tracking-tight text-balance">
            Signature complete
          </h1>
          <p className="mt-3 max-w-[48ch] text-base text-pretty text-zinc-600 dark:text-zinc-400">
            Your engagement letter has been signed and sent to {FIRM_NAME} for countersignature.
          </p>

          <dl className="mt-10 w-full max-w-2xl border-t border-zinc-950/5 text-left">
            <div className="flex items-start justify-between gap-6 border-b border-zinc-950/5 py-4">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Client</dt>
              <dd className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{intake.name}</dd>
            </div>
            <div className="flex items-start justify-between gap-6 border-b border-zinc-950/5 py-4">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Email</dt>
              <dd className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{intake.email}</dd>
            </div>
            <div className="flex items-start justify-between gap-6 border-b border-zinc-950/5 py-4">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Matter type</dt>
              <dd className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{intake.matterType}</dd>
            </div>
            {retainer && (
              <div className="flex items-start justify-between gap-6 border-b border-zinc-950/5 py-4">
                <dt className="text-sm text-zinc-500 dark:text-zinc-400">Retainer</dt>
                <dd className="tabular-nums text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  ${retainer.toLocaleString()}
                </dd>
              </div>
            )}
            {intake.description && (
              <div className="py-4">
                <dt className="text-sm text-zinc-500 dark:text-zinc-400">Matter summary</dt>
                <dd className="mt-2 max-w-[56ch] text-sm text-pretty text-zinc-950 dark:text-zinc-50">
                  {intake.description}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-2">
          <h1 className="max-w-[35ch] text-xl font-semibold text-balance text-zinc-950 dark:text-zinc-50">
            Review your engagement letter
          </h1>
          <p className="max-w-[48ch] text-base text-pretty text-zinc-600 dark:text-zinc-400">
            Please review and sign your engagement letter for{" "}
            <strong className="font-medium text-zinc-950 dark:text-zinc-50">{intake?.matterType ?? "your matter"}</strong>.
          </p>
        </div>

        {loading && (
          <div className="flex h-[75dvh] min-h-[720px] items-center justify-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Preparing your engagement letter...</p>
          </div>
        )}

        {error && (
          <div className="flex h-[75dvh] min-h-[720px] items-center justify-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {signingToken && (
          <EmbedSignDocument
            token={signingToken}
            host={host}
            onDocumentCompleted={() => setCompleted(true)}
            className="h-[75dvh] min-h-[720px] w-full"
          />
        )}
      </div>
    </main>
  )
}
