"use client"

import { useCallback, useEffect, useState } from "react"
import { unstable_EmbedCreateDocument as EmbedCreateDocument } from "@documenso/embed-react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { NotarySession } from "@/lib/mock-data"

export function PrepareDocument({ session }: { session: NotarySession }) {
  const [presignToken, setPresignToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)

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

  const handleDocumentCreated = useCallback(() => {
    setCreated(true)
  }, [])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (created) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold">Document Prepared</h2>
        <p className="text-sm text-muted-foreground">
          The document for {session.clientName}&apos;s{" "}
          {session.documentType.toLowerCase()} session has been prepared and is
          ready for signing.
        </p>
      </div>
    )
  }

  if (!presignToken) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading document editor...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
        Upload the document for <strong>{session.clientName}</strong>, add
        signer fields, and save when ready.
      </div>
      <div className="overflow-hidden rounded-lg border">
        <EmbedCreateDocument
          className="h-[75dvh] w-full"
          host={host}
          presignToken={presignToken}
          onDocumentCreated={handleDocumentCreated}
        />
      </div>
    </div>
  )
}
