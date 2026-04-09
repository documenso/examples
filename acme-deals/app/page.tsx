"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { EmbedSignDocument } from "@documenso/embed-react"
import { DataRoom } from "@/components/data-room"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DEAL_ACCESS_COPY, DEAL_HEADLINE, DEAL_NAME } from "@/lib/acme-deal"

type FlowState = "locked" | "preparing" | "signing" | "completing"

type CompletedDocumentPayload = {
  token: string
  documentId: number
  recipientId: number
}

type FinalizeAccessPayload = CompletedDocumentPayload & {
  recipientName: string
  recipientEmail: string
}

const accessNotes = [
  {
    label: "Document",
    value: "Mutual NDA",
  },
  {
    label: "Unlock",
    value: "3 diligence files",
  },
  {
    label: "Handoff",
    value: "Inline signature",
  },
] as const

const roomContents = [
  "Executive CIM",
  "Historical financials",
  "Management overview",
] as const

async function getResponseError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string }

    return data.error ?? fallback
  } catch {
    return fallback
  }
}

export default function Page() {
  const router = useRouter()
  const [flowState, setFlowState] = useState<FlowState>("locked")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [signingToken, setSigningToken] = useState("")
  const [error, setError] = useState("")
  const [completedPayload, setCompletedPayload] =
    useState<FinalizeAccessPayload | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFlowState("preparing")
    setError("")
    setCompletedPayload(null)

    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })

      if (!res.ok) {
        throw new Error(
          await getResponseError(res, "Failed to prepare the NDA document.")
        )
      }

      const data = (await res.json()) as {
        signingToken?: string
      }

      if (!data.signingToken) {
        throw new Error("The NDA document was created without a signing token.")
      }

      setSigningToken(data.signingToken)
      setFlowState("signing")
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to generate NDA. Please try again."
      )
      setFlowState("locked")
    }
  }

  async function finalizeAccess(payload: FinalizeAccessPayload) {
    setCompletedPayload(payload)
    setFlowState("completing")
    setError("")

    try {
      const res = await fetch("/api/access/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(
          await getResponseError(
            res,
            "Signed access could not be completed. Please try again."
          )
        )
      }

      router.push("/data-room")
    } catch (completionError) {
      setError(
        completionError instanceof Error
          ? completionError.message
          : "Signed access could not be completed. Please try again."
      )
      setFlowState("signing")
    }
  }

  function handleDocumentError() {
    setError("The embedded signer could not be loaded. Please try again.")
    setCompletedPayload(null)
    setFlowState("locked")
  }

  const isPreparing = flowState === "preparing"
  const isCompleting = flowState === "completing"
  const isSigning = flowState === "signing" || flowState === "completing"

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/" aria-label="Homepage" className="text-sm font-medium">
            AcmeDeals
          </Link>
          <span className="text-sm text-muted-foreground">{DEAL_NAME}</span>
        </div>
      </header>

      <main className="isolate mx-auto max-w-5xl px-6 py-10">
        {isSigning ? (
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Signature required
              </p>
              <h1 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Review and sign the mutual NDA.
              </h1>
              <p className="max-w-[60ch] text-base text-pretty text-muted-foreground">
                The document is opened inline and uses the full desktop width so
                it is easy to review before signing.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4 shrink-0" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-lg border border-border">
              <div className="border-b border-border px-5 py-4 text-sm text-muted-foreground">
                Prepared for {name || "your signature"} · access opens
                immediately after signing.
              </div>
              <div className="p-2">
                <EmbedSignDocument
                  token={signingToken}
                  host={
                    process.env.NEXT_PUBLIC_DOCUMENSO_HOST ||
                    "https://app.documenso.com"
                  }
                  name={name}
                  lockName
                  onDocumentCompleted={(payload) => {
                    void finalizeAccess({
                      ...payload,
                      recipientName: name.trim(),
                      recipientEmail: email.trim(),
                    })
                  }}
                  onDocumentReady={() => {}}
                  onDocumentError={handleDocumentError}
                  className="min-h-[80svh] w-full"
                />
              </div>
            </div>

            {completedPayload && !isCompleting && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void finalizeAccess(completedPayload)
                }}
              >
                Continue to data room
              </Button>
            )}

            {isCompleting && (
              <div className="flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 shrink-0 animate-spin" />
                Saving signed access…
              </div>
            )}
          </section>
        ) : (
          <div className="space-y-10">
            <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
              <div className="space-y-8">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Confidential mandate
                  </p>
                  <h1 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                    {DEAL_HEADLINE}
                  </h1>
                  <p className="max-w-[60ch] text-base text-pretty text-muted-foreground">
                    Sign the mutual NDA to unlock the deal materials. The NDA is
                    generated from the Documenso template, prefilled with your
                    name, and opened inline for signature.
                  </p>
                </div>

                <dl className="grid gap-x-8 gap-y-4 border-y border-border py-4 text-sm sm:grid-cols-3">
                  {accessNotes.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <dt className="text-sm text-muted-foreground">
                        {item.label}
                      </dt>
                      <dd className="font-medium">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <aside className="space-y-4 border-l border-border pl-6 lg:pl-8">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Room contents</p>
                  <p className="text-sm text-pretty text-muted-foreground">
                    The locked room contains the initial materials typically
                    shared in a first diligence pass.
                  </p>
                </div>

                <ul
                  role="list"
                  className="space-y-2 text-sm text-muted-foreground"
                >
                  {roomContents.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </aside>
            </section>

            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-balance">
                  {DEAL_ACCESS_COPY}
                </h2>
                <p className="max-w-[70ch] text-sm text-pretty text-muted-foreground">
                  Enter your name and work email to generate the NDA and open
                  the signing flow.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,16rem)_minmax(0,16rem)_minmax(0,1fr)] lg:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      className="w-full max-w-xs"
                      placeholder="Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Work email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="w-full max-w-xs"
                      placeholder="jane@firm.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1 border-l border-border pl-4 lg:pl-5">
                    <p className="text-sm font-medium">Access control</p>
                    <p className="text-sm text-pretty text-muted-foreground">
                      Access opens as soon as the completed signing session is
                      saved for this browser.
                    </p>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isPreparing}>
                  {isPreparing ? (
                    <>
                      <Loader2 className="size-4 shrink-0 animate-spin" />
                      Preparing NDA…
                    </>
                  ) : (
                    DEAL_ACCESS_COPY
                  )}
                </Button>
              </form>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-balance">
                  Data room preview
                </h2>
                <p className="text-sm text-muted-foreground">
                  The structure is visible below. Files remain locked until the
                  NDA is complete.
                </p>
              </div>

              <div className="pointer-events-none blur-xl transition-[filter] duration-700 select-none">
                <DataRoom mode="preview" />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
