"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Paintbrush } from "lucide-react"
import { unstable_EmbedCreateDocument as EmbedCreateDocument } from "@documenso/embed-react"

export default function DraftSOWPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [presignToken, setPresignToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  useEffect(() => {
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
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href={`/projects/${params.id}`}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Paintbrush className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Draft Statement of Work
          </h1>
          <p className="text-muted-foreground text-sm">
            Compose the SOW, add the client as a recipient, then send.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!presignToken && !error && (
        <div className="flex h-[600px] items-center justify-center rounded-lg border">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      )}

      {presignToken && (
        <div className="overflow-hidden rounded-lg border">
          <EmbedCreateDocument
            className="h-[80dvh] w-full"
            host={host}
            presignToken={presignToken}
            onDocumentCreated={() => {
              router.push(`/projects/${params.id}`)
            }}
          />
        </div>
      )}
    </div>
  )
}
