"use client"

import { useState, useCallback } from "react"
import { EmbedSignDocument } from "@documenso/embed-react"
import { Card, CardContent } from "@/components/ui/card"
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
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <PartyPopper className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Onboarding Complete!</h2>
          <p className="mt-2 text-muted-foreground">
            All documents have been signed successfully for{" "}
            {session.employeeName}.
          </p>
        </div>
        <Progress value={100} className="h-3 w-full max-w-md" />
        <p className="text-sm font-medium text-primary">3/3 documents signed</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Signing progress</span>
          <span className="font-medium">{signedCount}/3 documents signed</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const active = isStepActive(steps, index)
          const locked = !step.signed && !active
          const signing = activeDoc === step.key

          return (
            <div key={step.key} className="space-y-0">
              <Card
                className={cn(
                  "transition-colors",
                  active && "border-primary/50 bg-primary/5",
                  step.signed && "border-primary/30 bg-primary/5",
                  locked && "opacity-60",
                )}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      step.signed
                        ? "bg-primary/10 text-primary"
                        : active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {step.signed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : locked ? (
                      <Lock className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{step.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {step.signed
                        ? "Signed and completed"
                        : active
                          ? "Ready to sign"
                          : "Awaiting previous document"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {step.signed ? (
                      <Badge variant="default" className="bg-primary">
                        Signed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}

                    {active && !signing && (
                      <Button
                        size="sm"
                        onClick={() => setActiveDoc(step.key)}
                        disabled={completing}
                      >
                        Sign Now
                      </Button>
                    )}

                    {signing && completing && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {signing && step.token && (
                <div className="overflow-hidden rounded-b-lg border border-t-0">
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
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
