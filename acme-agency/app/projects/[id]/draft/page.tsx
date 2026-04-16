"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { EmbedCreateEnvelopeV2 } from "@documenso/embed-react"
import { useProjectsState } from "@/hooks/use-project-state"

export default function DraftSOWPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { getProject, markSowSent } = useProjectsState()
  const [presignToken, setPresignToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"
  const project = getProject(params.id)

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
    if (project && !presignToken && !error) {
      fetchToken()
    }
  }, [error, presignToken, project])

  if (!project) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href={`/projects/${params.id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Back to project
      </Link>

      <header className="mt-6 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <p className="text-sm text-muted-foreground">{project.name}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
          Draft statement of work
        </h1>
        <p className="mt-4 max-w-[56ch] text-base text-pretty text-muted-foreground">
          Compose the statement of work, add the client as a recipient, then
          send it for signature.
        </p>
      </header>

      {error && (
        <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!presignToken && !error && (
        <div className="mt-6 flex min-h-[40rem] items-center justify-center rounded-xl border border-zinc-950/10 bg-muted/20 px-6 text-sm text-muted-foreground dark:border-white/10">
          {isRedirecting ? "Preparing client signing…" : "Loading authoring…"}
        </div>
      )}

      {presignToken && (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-950/10 bg-background dark:border-white/10">
          <EmbedCreateEnvelopeV2
            className="h-[80dvh] min-h-[42rem] w-full"
            host={host}
            presignToken={presignToken}
            type="DOCUMENT"
            onEnvelopeCreated={async ({ envelopeId }) => {
              try {
                setIsRedirecting(true)
                setPresignToken(null)
                const normalizedEnvelopeId = String(envelopeId)

                const response = await fetch("/api/document-token", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ envelopeId: normalizedEnvelopeId }),
                })

                if (!response.ok) {
                  throw new Error("Failed to prepare the SOW for signing")
                }

                const data = await response.json()

                await markSowSent(project.id, {
                  envelopeId: normalizedEnvelopeId,
                  name: "Statement of Work",
                })

                router.push(
                  `/projects/${params.id}/sign?token=${encodeURIComponent(data.signingToken)}&flow=sow&envelopeId=${encodeURIComponent(normalizedEnvelopeId)}`
                )
              } catch (err) {
                setIsRedirecting(false)
                setError(err instanceof Error ? err.message : "Unknown error")
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
