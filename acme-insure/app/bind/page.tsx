"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { Check, PartyPopper } from "lucide-react"
import { EmbedSignDocument } from "@documenso/embed-react"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getQuoteById } from "@/lib/quotes"

type Stage = "form" | "signing" | "complete"

function BindContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteId = searchParams.get("quoteId")
  const year = searchParams.get("year")
  const make = searchParams.get("make")
  const model = searchParams.get("model")
  const zip = searchParams.get("zip")
  const missingQuoteContext = !quoteId || !year || !make || !model

  const [stage, setStage] = useState<Stage>("form")
  const [applicantName, setApplicantName] = useState("")
  const [email, setEmail] = useState("")
  const [signingToken, setSigningToken] = useState("")
  const [policyNumber, setPolicyNumber] = useState("")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const quote = quoteId ? getQuoteById(quoteId) : null
  const selectedQuote = quote ?? null
  const vehicleLabel = year && make && model ? `${year} ${make} ${model}` : ""
  const quotesHref = useMemo(() => {
    if (!year || !make || !model || !zip) {
      return "/"
    }

    return `/quotes?${new URLSearchParams({ year, make, model, zip }).toString()}`
  }, [make, model, year, zip])
  const canContinue = Boolean(applicantName.trim() && email.trim())

  useEffect(() => {
    if (missingQuoteContext) {
      router.replace(quotesHref)
      return
    }

    if (!selectedQuote) {
      router.replace("/")
    }
  }, [missingQuoteContext, quotesHref, router, selectedQuote])

  if (missingQuoteContext || !selectedQuote) return null
  const activeQuote = selectedQuote

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canContinue) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantName: applicantName.trim(),
          email: email.trim(),
          vehicleYear: year,
          vehicleMake: make,
          vehicleModel: model,
          vehicleInfo: vehicleLabel,
          coverageType: activeQuote.coverageType,
          premium: activeQuote.premium,
        }),
      })
      const data = await response.json()

      if (
        !response.ok ||
        !data.signingToken ||
        !data.policyNumber ||
        !data.effectiveDate
      ) {
        throw new Error(data.error || "Failed to generate document")
      }

      setSigningToken(data.signingToken)
      setPolicyNumber(data.policyNumber)
      setEffectiveDate(data.effectiveDate)
      setStage("signing")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AppHeader backHref={quotesHref} backLabel="Quotes" />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
        {stage === "form" && (
          <>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-primary">Application</p>
              <h1 className="max-w-[18ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Complete your application for {activeQuote.carrier}.
              </h1>
              <p className="max-w-[54ch] text-base text-muted-foreground text-pretty sm:text-lg">
                Confirm the quote details, add the applicant information, and
                move straight into signing.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
              <aside className="flex flex-col gap-5 border-y border-border/60 py-5 lg:py-0 lg:pr-8 lg:border-y-0 lg:border-r">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-primary">
                    {activeQuote.coverageType}
                  </p>
                  <h2 className="text-lg font-semibold tracking-tight text-balance">
                    {activeQuote.carrier}
                  </h2>
                </div>

                <div className="flex items-end gap-1">
                  <p className="text-4xl font-semibold tracking-tight tabular-nums text-primary">
                    ${activeQuote.premium}
                  </p>
                  <p className="pb-1 text-sm text-muted-foreground">/mo</p>
                </div>

                <dl className="grid gap-3 border-t border-border/60 pt-4 text-sm">
                  <div className="grid gap-1">
                    <dt className="font-medium text-foreground">Vehicle</dt>
                    <dd className="text-muted-foreground">{vehicleLabel}</dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="font-medium text-foreground">ZIP code</dt>
                    <dd className="text-muted-foreground tabular-nums">{zip}</dd>
                  </div>
                </dl>

                <ul
                  role="list"
                  className="flex flex-col gap-2 border-t border-border/60 pt-4 text-sm text-muted-foreground"
                >
                  {activeQuote.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 stroke-muted-foreground" />
                      <span className="text-pretty">{feature}</span>
                    </li>
                  ))}
                </ul>
              </aside>

              <section className="flex flex-col gap-5 lg:pl-2">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold tracking-tight text-balance">
                    Applicant details
                  </h2>
                  <p className="max-w-[52ch] text-base text-muted-foreground text-pretty sm:text-sm/6">
                    We&apos;ll use this to generate the application document and
                    send it into signing.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="applicantName">Applicant name</Label>
                    <Input
                      id="applicantName"
                      name="applicantName"
                      placeholder="Jane Driver"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {error ? (
                    <p className="rounded-3xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    className="mt-2 w-full sm:w-auto"
                    disabled={loading || !canContinue}
                  >
                    {loading ? "Generating application..." : "Continue to sign"}
                  </Button>
                </form>
              </section>
            </div>
          </>
        )}

        {stage === "signing" && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-primary">Signing</p>
              <h1 className="max-w-[32ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Review and sign the application.
              </h1>
              <p className="max-w-[54ch] text-base text-muted-foreground text-pretty sm:text-lg">
                Confirm the details for {activeQuote.carrier} and complete the
                signature to bind coverage.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 border-y border-border/60 py-4 text-sm sm:grid-cols-3">
                <div className="grid gap-1">
                  <p className="font-medium text-foreground">Carrier</p>
                  <p className="text-muted-foreground">{activeQuote.carrier}</p>
                </div>
                <div className="grid gap-1">
                  <p className="font-medium text-foreground">Coverage</p>
                  <p className="text-muted-foreground">{activeQuote.coverageType}</p>
                </div>
                <div className="grid gap-1">
                  <p className="font-medium text-foreground">Premium</p>
                  <p className="text-muted-foreground tabular-nums">${activeQuote.premium}/mo</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
              <EmbedSignDocument
                token={signingToken}
                host={
                  process.env.NEXT_PUBLIC_DOCUMENSO_HOST ||
                  "https://app.documenso.com"
                }
                onDocumentCompleted={() => setStage("complete")}
                onDocumentError={(err) => console.error("Signing error:", err)}
                className="h-[680px] w-full"
              />
            </div>
            </div>
          </section>
        )}

        {stage === "complete" && (
          <section className="flex max-w-3xl flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary">
                <PartyPopper className="size-4 shrink-0" />
                <p className="text-sm font-medium">Coverage bound</p>
              </div>
              <h1 className="max-w-[18ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Your policy is active.
              </h1>
              <p className="max-w-[48ch] text-base text-muted-foreground text-pretty">
                A confirmation email has been sent to {email}. The policy
                details are below for reference.
              </p>
            </div>

            <dl className="divide-y divide-border/60 border-y border-border/60">
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center">
                <dt className="text-sm font-medium text-foreground">Policy number</dt>
                <dd className="text-sm text-muted-foreground tabular-nums">{policyNumber}</dd>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center">
                <dt className="text-sm font-medium text-foreground">Applicant</dt>
                <dd className="text-sm text-muted-foreground">{applicantName}</dd>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center">
                <dt className="text-sm font-medium text-foreground">Carrier</dt>
                <dd className="text-sm text-muted-foreground">{activeQuote.carrier}</dd>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center">
                <dt className="text-sm font-medium text-foreground">Coverage</dt>
                <dd className="text-sm text-muted-foreground">{activeQuote.coverageType}</dd>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center">
                <dt className="text-sm font-medium text-foreground">Premium</dt>
                <dd className="text-sm text-muted-foreground tabular-nums">${activeQuote.premium}/mo</dd>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center">
                <dt className="text-sm font-medium text-foreground">Vehicle</dt>
                <dd className="text-sm text-muted-foreground">{vehicleLabel}</dd>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center">
                <dt className="text-sm font-medium text-foreground">Effective date</dt>
                <dd className="text-sm text-muted-foreground tabular-nums">{effectiveDate}</dd>
              </div>
            </dl>

            <Button
              className="w-full sm:w-auto"
              variant="outline"
              onClick={() => router.push("/")}
            >
              Get another quote
            </Button>
          </section>
        )}
      </main>
    </>
  )
}

export default function BindPage() {
  return (
    <Suspense>
      <div className="min-h-svh">
        <BindContent />
      </div>
    </Suspense>
  )
}
