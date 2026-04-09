"use client"

import { use, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  Lock,
  FileText,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { EmbedSignDocument } from "@documenso/embed-react"

type DocKey = "ima" | "fee" | "adv"

interface ClientSession {
  id: string
  clientName: string
  email: string
  aum: string
  fee: string
  pipelineStage: string
  imaToken: string | null
  imaSigned: boolean
  feeToken: string | null
  feeSigned: boolean
  advToken: string | null
  advSigned: boolean
}

const docs: { key: DocKey; label: string; description: string }[] = [
  {
    key: "ima",
    label: "Investment Management Agreement",
    description: "Authorizes Meridian Wealth Advisors to manage your portfolio",
  },
  {
    key: "fee",
    label: "Fee Acknowledgment",
    description: "Confirms the agreed-upon fee schedule and billing terms",
  },
  {
    key: "adv",
    label: "ADV Part 2 Disclosure",
    description: "SEC-required disclosure about advisory services and practices",
  },
]

function getToken(session: ClientSession, key: DocKey): string | null {
  const map: Record<DocKey, string | null> = {
    ima: session.imaToken,
    fee: session.feeToken,
    adv: session.advToken,
  }
  return map[key]
}

function isSigned(session: ClientSession, key: DocKey): boolean {
  const map: Record<DocKey, boolean> = {
    ima: session.imaSigned,
    fee: session.feeSigned,
    adv: session.advSigned,
  }
  return map[key]
}

export default function OnboardingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [session, setSession] = useState<ClientSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDoc, setActiveDoc] = useState<DocKey | null>(null)
  const [completing, setCompleting] = useState(false)

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${id}`)
      if (res.ok) {
        const data = await res.json()
        setSession(data)
      }
    } catch (err) {
      console.error("Failed to fetch session:", err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const signedCount = session
    ? [session.imaSigned, session.feeSigned, session.advSigned].filter(Boolean)
        .length
    : 0

  const progressPercent = (signedCount / 3) * 100

  // Determine which doc is currently actionable
  function getDocStatus(
    key: DocKey,
    index: number
  ): "signed" | "active" | "locked" {
    if (!session) return "locked"
    if (isSigned(session, key)) return "signed"
    // Active if all previous docs are signed
    const prevKeys = docs.slice(0, index).map((d) => d.key)
    const allPrevSigned = prevKeys.every((k) => isSigned(session, k))
    return allPrevSigned ? "active" : "locked"
  }

  async function handleDocumentCompleted(key: DocKey) {
    setCompleting(true)
    try {
      await fetch(`/api/clients/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: key }),
      })
      setActiveDoc(null)
      await fetchSession()
    } catch (err) {
      console.error("Failed to mark complete:", err)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Session not found</p>
          <Link href="/">
            <Button variant="outline">Back to Pipeline</Button>
          </Link>
        </div>
      </div>
    )
  }

  const allSigned = signedCount === 3

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Meridian Wealth Advisors</h1>
              <p className="text-muted-foreground text-xs">Document Signing</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pipeline
        </Link>

        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Onboarding: {session.clientName}
          </h2>
          <p className="text-muted-foreground mt-1">
            {session.aum} AUM &middot; {session.email}
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                Signing Progress
              </span>
              <span className="text-muted-foreground text-sm">
                {signedCount}/3 documents signed
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            {allSigned && (
              <div className="mt-3 flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  All documents signed — client is now active
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Steps */}
        <div className="space-y-4">
          {docs.map((doc, index) => {
            const status = getDocStatus(doc.key, index)
            const token = getToken(session, doc.key)

            return (
              <Card
                key={doc.key}
                className={
                  status === "active"
                    ? "border-primary/50"
                    : status === "signed"
                      ? "border-primary/20 bg-muted"
                      : "opacity-60"
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          status === "signed"
                            ? "bg-primary text-primary-foreground"
                            : status === "active"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {status === "signed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base">{doc.label}</CardTitle>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                    <div>
                      {status === "signed" ? (
                        <Badge>
                          Signed
                        </Badge>
                      ) : status === "active" ? (
                        activeDoc === doc.key ? (
                          <Badge variant="outline">
                            Signing...
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setActiveDoc(doc.key)}
                          >
                            <FileText className="mr-1 h-4 w-4" />
                            Sign Now
                          </Button>
                        )
                      ) : (
                        <Badge variant="secondary">
                          <Lock className="mr-1 h-3 w-3" />
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Embedded signing */}
                {activeDoc === doc.key && token && (
                  <CardContent className="pt-0">
                    <div className="overflow-hidden rounded-lg border">
                      <EmbedSignDocument
                        token={token}
                        host={host}
                        onDocumentCompleted={() =>
                          handleDocumentCompleted(doc.key)
                        }
                        className="h-[600px] w-full"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {allSigned && (
          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                Return to Pipeline
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
