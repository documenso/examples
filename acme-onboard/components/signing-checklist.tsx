"use client"

import { useState, useCallback } from "react"
import { EmbedSignDocument } from "@documenso/embed-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Lock,
  CheckCircle2,
  PartyPopper,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SessionData {
  id: string
  employeeName: string
  email: string
  role: string
  startDate: string
  salary: string
  offerToken: string | null
  offerSigned: boolean
  ndaToken: string | null
  ndaSigned: boolean
  handbookToken: string | null
  handbookSigned: boolean
}

interface DocumentStep {
  key: "offer" | "nda" | "handbook"
  label: string
  token: string | null
  signed: boolean
}

function getSteps(session: SessionData): DocumentStep[] {
  return [
    {
      key: "offer",
      label: "Offer Letter",
      token: session.offerToken,
      signed: session.offerSigned,
    },
    {
      key: "nda",
      label: "Non-Disclosure Agreement",
      token: session.ndaToken,
      signed: session.ndaSigned,
    },
    {
      key: "handbook",
      label: "Handbook Acknowledgment",
      token: session.handbookToken,
      signed: session.handbookSigned,
    },
  ]
}

function isStepActive(steps: DocumentStep[], index: number): boolean {
  if (steps[index].signed) return false
  // Active if all previous steps are signed
  return steps.slice(0, index).every((s) => s.signed)
}

export function SigningChecklist({
  initialSession,
}: {
  initialSession: SessionData
}) {
  const [session, setSession] = useState<SessionData>(initialSession)
  const [activeDoc, setActiveDoc] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)

  const steps = getSteps(session)
  const signedCount = steps.filter((s) => s.signed).length
  const allComplete = signedCount === 3
  const progressPercent = Math.round((signedCount / 3) * 100)

  const handleDocumentCompleted = useCallback(
    async (docKey: "offer" | "nda" | "handbook") => {
      setCompleting(true)
      try {
        const res = await fetch(`/api/onboarding/${session.id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document: docKey }),
        })

        if (!res.ok) {
          console.error("Failed to mark document complete")
          return
        }

        // Re-fetch session state
        const sessionRes = await fetch(`/api/onboarding/${session.id}`)
        if (sessionRes.ok) {
          const updated = await sessionRes.json()
          setSession(updated)
        }
      } catch (err) {
        console.error("Error completing document:", err)
      } finally {
        setActiveDoc(null)
        setCompleting(false)
      }
    },
    [session.id],
  )

  if (allComplete) {
    return (
      <section className="flex flex-col gap-5 border-t border-border/60 pt-8">
        <div className="flex items-center gap-2 text-base/7 text-primary sm:text-sm/6">
          <PartyPopper className="size-4 shrink-0 stroke-primary" />
          <span>Complete</span>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="max-w-[35ch] text-2xl font-semibold tracking-tight text-balance sm:text-xl">
            Onboarding complete
          </h2>
          <p className="max-w-[56ch] text-base/7 text-pretty text-muted-foreground sm:text-sm/6">
            All documents have been signed successfully for {session.employeeName}.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Progress value={100} className="h-2 w-full max-w-xl" />
          <p className="text-base/7 font-medium tabular-nums text-foreground sm:text-sm/6">
            3/3 documents signed
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6 border-t border-border/60 pt-8">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-xl">
            Signature checklist
          </h2>
          <p className="max-w-[56ch] text-base/7 text-pretty text-muted-foreground sm:text-sm/6">
            Complete each document in order. The next item unlocks
            automatically after the current signature finishes processing.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 text-base/7 sm:text-sm/6">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium tabular-nums text-foreground">
              {signedCount}/3 signed
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      <div className="flex flex-col">
        {steps.map((step, index) => {
          const active = isStepActive(steps, index)
          const locked = !step.signed && !active
          const signing = activeDoc === step.key

          return (
            <section
              key={step.key}
              className={cn(
                "flex flex-col gap-0 border-t border-border/60 py-5 first:border-t-0 first:pt-0 last:pb-0",
                signing && "pb-0",
              )}
            >
              <div
                className={cn(
                  "rounded-3xl transition-colors",
                  active && "bg-primary/[0.035]",
                )}
              >
                <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 text-base/7 font-medium tabular-nums text-foreground sm:text-sm/6">
                      {index + 1}
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex items-center gap-2 text-base/7 sm:text-sm/6">
                        {step.signed ? (
                          <CheckCircle2 className="size-4 shrink-0 stroke-primary" />
                        ) : locked ? (
                          <Lock className="size-4 shrink-0 stroke-muted-foreground" />
                        ) : (
                          <FileText className="size-4 shrink-0 stroke-foreground" />
                        )}
                        <p className="font-medium text-foreground">
                          {step.label}
                        </p>
                      </div>
                      <p className="max-w-[56ch] text-base/7 text-pretty text-muted-foreground sm:text-sm/6">
                        {step.signed
                          ? "Signed and recorded."
                          : active
                            ? "Ready for signature."
                            : "Locked until the previous document is complete."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <Badge
                      variant={step.signed ? "default" : "secondary"}
                      className={cn(
                        "w-fit",
                        step.signed && "bg-primary text-primary-foreground",
                      )}
                    >
                      {step.signed
                        ? "Signed"
                        : active
                          ? "Ready"
                          : "Pending"}
                    </Badge>

                    {active && !signing ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setActiveDoc(step.key)}
                        disabled={completing}
                      >
                        Sign now
                      </Button>
                    ) : null}

                    {signing && completing ? (
                      <div className="flex items-center gap-2 text-base/7 text-muted-foreground sm:text-sm/6">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Finishing signature…</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {signing && step.token ? (
                <div className="mt-4 overflow-hidden rounded-4xl bg-background ring-1 ring-border/70">
                  <EmbedSignDocument
                    token={step.token}
                    host={
                      process.env.NEXT_PUBLIC_DOCUMENSO_HOST ||
                      "https://app.documenso.com"
                    }
                    onDocumentCompleted={() =>
                      handleDocumentCompleted(step.key)
                    }
                    onDocumentReady={() => {}}
                    onDocumentError={(err) =>
                      console.error("Signing error:", err)
                    }
                    className="h-[600px] w-full"
                  />
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
    </section>
  )
}
