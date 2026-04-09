"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { EmbedSignDocument } from "@documenso/embed-react"

import { Button } from "@/components/ui/button"

import {
  PAY_PERIOD,
  PROJECT_NAME,
  formatCurrency,
  getSubcontractor,
} from "@/lib/mock-data"
import { readWaiverSession, writeWaiverSession } from "@/lib/waiver-session"

interface SigningPageProps {
  subId: string
}

export function SigningPage({ subId }: SigningPageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState(() => readWaiverSession(subId))
  const sub = getSubcontractor(subId)
  const signed = session?.waiverStatus === "signed"
  const signingToken = session?.signingToken ?? null

  if (!sub) {
    return (
      <div className="isolate flex min-h-svh items-center justify-center bg-background px-6 py-10">
        <div className="max-w-md space-y-6">
          <div className="space-y-3">
            <p className="text-base font-medium text-zinc-500 sm:text-sm">
              Signing session
            </p>
            <h1 className="max-w-[20ch] text-4xl font-semibold tracking-tight text-balance">
              Subcontractor not found
            </h1>
            <p className="max-w-[48ch] text-base text-pretty text-zinc-600 sm:text-sm">
              No subcontractor exists with the ID &ldquo;{subId}&rdquo;.
            </p>
          </div>
          <Button
            type="button"
            data-icon="inline-start"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (signed) {
    return (
      <div className="isolate min-h-svh bg-background">
        <div className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-10 px-6 py-10">
          <div className="space-y-4">
            <p className="text-base font-medium text-zinc-500 sm:text-sm">
              Signing complete
            </p>
            <h1 className="max-w-[20ch] text-4xl font-semibold tracking-tight text-balance">
              Waiver signed and payment released
            </h1>
            <p className="max-w-[48ch] text-base text-pretty text-zinc-600 sm:text-sm">
              {sub.name} has completed the embedded waiver for{" "}
              {PROJECT_NAME}. Payment for this draw is now marked as released.
            </p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="border-t border-zinc-950/5 pt-4">
              <dt className="text-base font-medium text-zinc-500 sm:text-sm">
                Subcontractor
              </dt>
              <dd className="mt-2 text-base font-medium text-zinc-950 sm:text-sm">
                {sub.name}
              </dd>
            </div>
            <div className="border-t border-zinc-950/5 pt-4">
              <dt className="text-base font-medium text-zinc-500 sm:text-sm">
                Amount released
              </dt>
              <dd className="mt-2 text-base font-medium tabular-nums text-zinc-950 sm:text-sm">
                {formatCurrency(sub.amount)}
              </dd>
            </div>
            <div className="border-t border-zinc-950/5 pt-4">
              <dt className="text-base font-medium text-zinc-500 sm:text-sm">
                Pay period
              </dt>
              <dd className="mt-2 text-base font-medium text-zinc-950 sm:text-sm">
                {PAY_PERIOD.label}
              </dd>
            </div>
          </dl>

          <div>
            <Button
              type="button"
              data-icon="inline-start"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="isolate min-h-svh bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 lg:px-8">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-icon="inline-start"
          className="w-fit"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Button>

        <div className="grid gap-12 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="flex flex-col gap-10">
            <div className="space-y-4">
              <p className="text-base font-medium text-zinc-500 sm:text-sm">
                Embedded signing
              </p>
              <div className="space-y-3">
                <h1 className="max-w-[20ch] text-4xl font-semibold tracking-tight text-balance">
                  Conditional lien waiver for {sub.name}
                </h1>
                <p className="max-w-[48ch] text-base text-pretty text-zinc-600 sm:text-sm">
                  Review the waiver, complete the signature flow, and release
                  payment only after the document is finished.
                </p>
              </div>
            </div>

            <dl className="grid gap-4 border-y border-zinc-950/5 py-6">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base font-medium text-zinc-500 sm:text-sm">
                  Trade
                </dt>
                <dd className="text-base font-medium text-zinc-950 sm:text-sm">
                  {sub.trade}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base font-medium text-zinc-500 sm:text-sm">
                  Contract amount
                </dt>
                <dd className="text-base font-medium tabular-nums text-zinc-950 sm:text-sm">
                  {formatCurrency(sub.amount)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base font-medium text-zinc-500 sm:text-sm">
                  Project
                </dt>
                <dd className="text-right text-base font-medium text-zinc-950 sm:text-sm">
                  {PROJECT_NAME}
                </dd>
              </div>
            </dl>

            <div className="rounded-3xl bg-zinc-50/70 p-6">
              <div className="space-y-2">
                <p className="text-base font-medium text-zinc-950 sm:text-sm">
                  Release checkpoint
                </p>
                <p className="max-w-[34ch] text-base text-pretty text-zinc-600 sm:text-sm">
                  Payment stays pending until the waiver is fully signed.
                </p>
              </div>
              <div className="mt-5 border-t border-zinc-950/5 pt-4">
                <p className="text-base font-medium text-zinc-500 sm:text-sm">
                  Current draw
                </p>
                <p className="mt-2 text-base font-medium tabular-nums text-zinc-950 sm:text-sm">
                  {PAY_PERIOD.displayRange}
                </p>
              </div>
            </div>
          </aside>

          <section className="overflow-hidden rounded-3xl bg-background ring-1 ring-black/5 shadow-sm">
            {signingToken && !error ? (
              <EmbedSignDocument
                token={signingToken}
                host={
                  process.env.NEXT_PUBLIC_DOCUMENSO_HOST ||
                  "https://app.documenso.com"
                }
                name={sub.name}
                lockName
                onDocumentCompleted={() => {
                  const nextSession = {
                    documentId: session?.documentId ?? 0,
                    signingToken,
                    signerEmail: session?.signerEmail ?? "",
                    waiverStatus: "signed" as const,
                    paymentStatus: "released" as const,
                    completedAt: new Date().toISOString(),
                  }

                  writeWaiverSession(subId, nextSession)
                  setSession(nextSession)
                }}
                onDocumentReady={() => setError(null)}
                onDocumentError={() =>
                  setError(
                    "The embedded signing session failed to load. Please try again from the dashboard."
                  )
                }
                className="h-[860px] w-full lg:h-[960px]"
              />
            ) : (
              <div className="flex min-h-[860px] flex-col items-center justify-center gap-6 px-8 text-center lg:min-h-[960px]">
                <div className="space-y-3">
                  <h2 className="max-w-[20ch] text-2xl font-semibold tracking-tight text-balance">
                    Signing session unavailable
                  </h2>
                  <p className="max-w-[42ch] text-base text-pretty text-zinc-600 sm:text-sm">
                    {error ??
                      "No signing token was found. Please create the waiver from the dashboard first."}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  data-icon="inline-start"
                  onClick={() => router.push("/")}
                >
                  <ArrowLeft className="size-4" />
                  Back to dashboard
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
