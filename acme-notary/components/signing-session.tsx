"use client"

import { useCallback, useEffect, useState } from "react"
import { EmbedSignDocument } from "@documenso/embed-react"
import {
  Video,
  Shield,
  CheckCircle2,
  Loader2,
  Stamp,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { NotarySession } from "@/lib/mock-data"

interface VerificationCheck {
  label: string
  completed: boolean
}

export function SigningSession({ session }: { session: NotarySession }) {
  const [signingToken, setSigningToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sealed, setSealed] = useState(false)
  const [checks, setChecks] = useState<VerificationCheck[]>([
    { label: "ID Verified", completed: false },
    { label: "Face Match", completed: false },
    { label: "Liveness Check", completed: false },
  ])

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  // Auto-complete identity verification checks
  useEffect(() => {
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
  }, [])

  // Fetch signing token
  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("/api/generate-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: session.clientName,
            email: session.clientEmail,
          }),
        })
        if (!res.ok) throw new Error("Failed to generate document")
        const data = await res.json()
        setSigningToken(data.signingToken)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }
    fetchToken()
  }, [session.clientName, session.clientEmail])

  const allChecksComplete = checks.every((c) => c.completed)

  const handleDocumentCompleted = useCallback(() => {
    setSealed(true)
  }, [])

  return (
    <div className="flex h-[calc(100svh-57px)] flex-col lg:flex-row">
      {/* Left pane — Mock video call (40%) */}
      <div className="flex w-full flex-col border-b bg-muted/30 p-4 lg:w-[40%] lg:border-b-0 lg:border-r">
        {/* Video area */}
        <div className="relative mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-zinc-800">
          <Video className="h-12 w-12 text-zinc-500" />
          <Badge className="absolute left-3 top-3 bg-red-600 text-white hover:bg-red-600">
            Live
          </Badge>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
            <User className="h-3 w-3" />
            {session.clientName}
          </div>
        </div>

        {/* Identity Verification */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold">Identity Verification</h3>
          </div>

          <div className="space-y-2">
            {checks.map((check) => (
              <div
                key={check.label}
                className="flex items-center gap-2 text-sm"
              >
                {check.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <span
                  className={cn(
                    check.completed
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {check.label}
                </span>
              </div>
            ))}
          </div>

          {allChecksComplete && (
            <Badge
              variant="outline"
              className="border-green-600 text-green-600 dark:border-green-400 dark:text-green-400"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Identity Verified
            </Badge>
          )}
        </div>

        {/* Notary seal on completion */}
        {sealed && (
          <div className="mt-auto flex flex-col items-center gap-2 pt-6">
            <div className="animate-in zoom-in-50 duration-500 flex h-20 w-20 items-center justify-center rounded-full border-4 border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950">
              <Stamp className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Notary Seal Applied
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Right pane — Signing document (60%) */}
      <div className="flex min-h-0 w-full flex-col lg:w-[60%]">
        {error ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="text-sm text-destructive">
              Could not load document. Ensure DOCUMENSO_API_KEY and
              DOCUMENSO_TEMPLATE_ID are configured.
            </p>
          </div>
        ) : !signingToken ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading document...
            </span>
          </div>
        ) : (
          <EmbedSignDocument
            token={signingToken}
            host={host}
            onDocumentCompleted={handleDocumentCompleted}
            className="h-full w-full flex-1"
          />
        )}
      </div>
    </div>
  )
}
