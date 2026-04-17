"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { EmbedCreateEnvelopeV2 } from "@documenso/embed-react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AppHeader } from "@/components/app-header"
import { matters } from "@/lib/mock-data"

export default function ComposePage() {
  const { matterId } = useParams<{ matterId: string }>()
  const matter = matters.find((m) => m.id === matterId)

  const [presignToken, setPresignToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  useEffect(() => {
    async function fetchPresignToken() {
      try {
        const response = await fetch("/api/presign-token", {
          method: "POST",
        })

        if (!response.ok) {
          throw new Error("Failed to get presign token")
        }

        const data = await response.json()
        setPresignToken(data.presignToken)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchPresignToken()
  }, [])

  if (!matter) {
    return (
      <main className="min-h-dvh bg-background">
        <AppHeader />
        <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Matter not found.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4 shrink-0" />
            Back to matters
          </Link>
          <div className="space-y-1">
            <h1 className="max-w-[35ch] text-xl font-semibold text-balance text-zinc-950 dark:text-zinc-50">
              {matter.clientName}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {matter.matterType} · Compose a custom document
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex h-[80dvh] items-center justify-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Preparing document editor...</p>
          </div>
        )}

        {error && (
          <div className="flex h-[80dvh] items-center justify-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {created && (
          <div className="mb-4 rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300">
            Document created and sent successfully.
          </div>
        )}

        {presignToken && (
          <EmbedCreateEnvelopeV2
            className="h-[80dvh] w-full"
            host={host}
            presignToken={presignToken}
            externalId={matter.id}
            type="DOCUMENT"
            onEnvelopeCreated={() => setCreated(true)}
          />
        )}
      </div>
    </main>
  )
}
