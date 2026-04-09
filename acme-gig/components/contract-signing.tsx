"use client"

import { useCallback, useEffect, useState } from "react"
import { EmbedSignDocument } from "@documenso/embed-react"
import {
  FileSignature,
  CheckCircle2,
  Clock,
  DollarSign,
  CalendarDays,
  FileText,
  ShieldCheck,
  PartyPopper,
  Loader2,
  User,
  Aperture,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface GigSession {
  id: string
  clientEmail: string
  clientName: string
  deliverables: string
  deadline: string
  budget: string
  usageRights: string
  clientToken: string | null
  clientSigned: boolean
  creatorToken: string | null
  creatorSigned: boolean
  documentId: string | null
}

type Step = "loading" | "client-sign" | "client-done" | "creator-sign" | "complete"

export function ContractSigning({ contractId }: { contractId: string }) {
  const [session, setSession] = useState<GigSession | null>(null)
  const [step, setStep] = useState<Step>("loading")
  const [error, setError] = useState<string | null>(null)

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/contract/${contractId}`)
      if (!res.ok) throw new Error("Contract not found")
      const data: GigSession = await res.json()
      setSession(data)

      if (data.clientSigned && data.creatorSigned) {
        setStep("complete")
      } else if (data.clientSigned) {
        setStep("client-done")
      } else {
        setStep("client-sign")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contract")
    }
  }, [contractId])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  async function markSigned(party: "client" | "creator") {
    await fetch(`/api/contract/${contractId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ party }),
    })
    await fetchSession()
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "loading" || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-svh max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <FileSignature className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">
          Service Agreement
        </h1>
      </div>

      {/* Contract Summary */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contract Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Deliverables</p>
                <p className="text-sm">{session.deliverables}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="text-sm">{session.deadline}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="text-sm">
                  ${Number(session.budget).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Usage Rights</p>
                <p className="text-sm">{session.usageRights}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="mb-6 flex items-center gap-3">
        <StepIndicator
          label="Client"
          icon={<User className="h-3.5 w-3.5" />}
          done={step === "client-done" || step === "creator-sign" || step === "complete"}
          active={step === "client-sign"}
        />
        <div className="h-px flex-1 bg-border" />
        <StepIndicator
          label="Creator"
          icon={<Aperture className="h-3.5 w-3.5" />}
          done={step === "complete"}
          active={step === "creator-sign"}
        />
      </div>

      <Separator className="mb-6" />

      {/* Step 1: Client signs */}
      {step === "client-sign" && session.clientToken && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Badge className="gap-1">Step 1</Badge>
            <p className="text-sm font-medium">
              Sign as Client ({session.clientName})
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <EmbedSignDocument
              token={session.clientToken}
              host={host}
              onDocumentCompleted={() => markSigned("client")}
              className="h-[600px] w-full"
            />
          </div>
        </div>
      )}

      {/* Waiting for creator */}
      {step === "client-done" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">Client signed successfully</p>
          </div>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 p-8">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Waiting for Creator to sign...
              </p>
              <Button
                className="gap-2"
                onClick={() => setStep("creator-sign")}
              >
                <Aperture className="h-4 w-4" />
                Sign as Creator (Demo)
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Creator signs */}
      {step === "creator-sign" && session.creatorToken && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">
              Client signed
            </p>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <Badge className="gap-1">Step 2</Badge>
            <p className="text-sm font-medium">
              Sign as Creator (Jordan Lee)
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <EmbedSignDocument
              token={session.creatorToken}
              host={host}
              onDocumentCompleted={() => markSigned("creator")}
              className="h-[600px] w-full"
            />
          </div>
        </div>
      )}

      {/* Complete */}
      {step === "complete" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-4 p-10">
            <PartyPopper className="h-12 w-12 text-primary" />
            <div className="text-center">
              <h2 className="text-xl font-bold">Contract Signed</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Project Active — Both parties have signed the service agreement.
              </p>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                {session.clientName}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                Jordan Lee
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StepIndicator({
  label,
  icon,
  done,
  active,
}: {
  label: string
  icon: React.ReactNode
  done: boolean
  active: boolean
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        done
          ? "bg-primary/10 text-primary"
          : active
            ? "bg-secondary text-secondary-foreground"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : icon}
      {label}
    </div>
  )
}
