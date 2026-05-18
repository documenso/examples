"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { EmbedSignDocument } from "@documenso/embed-react"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getLoanOffer } from "@/lib/loan-offer"

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

function parseLoanAmount(value: string | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function OfferDetails({ terms }: { terms: ReturnType<typeof getLoanOffer> }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Amount</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(terms.amount)}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">APR</p>
        <p className="text-lg font-semibold tracking-tight tabular-nums">
          {terms.apr}%
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Term</p>
        <p className="text-lg font-semibold tracking-tight tabular-nums">
          {terms.termMonths} months
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Monthly payment</p>
        <p className="text-lg font-semibold tracking-tight tabular-nums">
          {formatCurrency(terms.monthlyPayment)}
        </p>
      </div>
    </div>
  )
}

export function ApprovedPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const businessName = searchParams.get("businessName")
  const loanPurpose = searchParams.get("purpose") ?? ""
  const selectedLoanAmount = parseLoanAmount(searchParams.get("loanAmount"))

  useEffect(() => {
    if (!businessName) {
      router.replace("/")
    }
  }, [businessName, router])

  const terms = useMemo(
    () => getLoanOffer(selectedLoanAmount),
    [selectedLoanAmount]
  )

  const [reviewing, setReviewing] = useState(true)

  useEffect(() => {
    if (!reviewing) return

    const reviewTimeout = window.setTimeout(() => {
      setReviewing(false)
    }, 2200)

    return () => {
      window.clearTimeout(reviewTimeout)
    }
  }, [reviewing])

  const [email, setEmail] = useState("")
  const [borrowerName, setBorrowerName] = useState("")
  const [signingToken, setSigningToken] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canGenerate = Boolean(
    borrowerName.trim() && email.trim() && businessName
  )

  async function handleSign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canGenerate || !businessName) return
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowerName,
          email,
          businessName,
          loanPurpose,
          loanAmount: terms.amount,
        }),
      })

      if (!res.ok) throw new Error("Failed to generate document")

      const data = await res.json()
      setSigningToken(data.signingToken)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  if (!businessName) return null

  if (reviewing) {
    return (
      <div className="bg-background">
        <main className="mx-auto flex min-h-svh max-w-6xl flex-col items-center justify-center px-6 py-16 text-center lg:px-8">
          <p className="text-sm font-medium text-muted-foreground">
            Acme Lending
          </p>
          <Loader2 className="mt-8 size-5 animate-spin stroke-primary" />
          <div className="mt-6 space-y-3">
            <h1 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Reviewing your application
            </h1>
            <p className="max-w-[48ch] text-base text-pretty text-muted-foreground">
              We&apos;re confirming final terms for {businessName}.
            </p>
          </div>
        </main>
      </div>
    )
  }

  if (signingToken) {
    return (
      <div className="bg-background">
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-12 lg:px-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">
                Acme Lending
              </p>
              <div className="space-y-3">
                <Badge variant="secondary" className="w-fit">
                  Agreement ready
                </Badge>
                <h1 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Review and sign your loan agreement
                </h1>
                <p className="max-w-[52ch] text-base text-pretty text-muted-foreground">
                  Finalize the {terms.termMonths}-month agreement for{" "}
                  {businessName} and we&apos;ll release funds as soon as the
                  signature is complete.
                </p>
              </div>
            </div>

            <OfferDetails terms={terms} />

            <div className="rounded-lg border border-border/60">
              <EmbedSignDocument
                token={signingToken}
                name={borrowerName}
                host={
                  process.env.NEXT_PUBLIC_DOCUMENSO_HOST ||
                  "https://app.documenso.com"
                }
                onDocumentCompleted={() => {
                  router.push("/funded")
                }}
                onDocumentReady={() => {}}
                onDocumentError={(err) => console.error("Signing error:", err)}
                lockName
                className="h-[84svh] min-h-[920px] w-full rounded-lg"
              />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <main className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-14">
          <section className="space-y-10">
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">
                Acme Lending
              </p>
              <div className="space-y-3">
                <Badge variant="secondary" className="w-fit">
                  Pre-approved offer
                </Badge>
                <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  Approved for {formatCurrency(terms.amount)}.
                </h1>
                <p className="max-w-[44ch] text-base text-pretty text-muted-foreground">
                  {businessName} can move straight to the agreement and sign
                  whenever you&apos;re ready.
                </p>
              </div>
            </div>

            <OfferDetails terms={terms} />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Business</p>
                <p className="text-base font-medium text-pretty">
                  {businessName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Purpose</p>
                <p className="text-base font-medium text-pretty">
                  {loanPurpose
                    .split("-")
                    .filter(Boolean)
                    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                    .join(" ") || "Working capital"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Next step</p>
                <p className="text-base font-medium text-pretty">
                  Confirm borrower details and open the agreement.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-muted/30 p-7 sm:p-8">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Borrower details
              </p>
              <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight text-balance">
                Generate your agreement
              </h2>
              <p className="max-w-[44ch] text-base text-pretty text-muted-foreground">
                We&apos;ll insert the approved terms automatically. Just confirm
                who should sign.
              </p>
            </div>

            <form onSubmit={handleSign} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="borrowerName">Borrower name</Label>
                <Input
                  id="borrowerName"
                  name="borrowerName"
                  placeholder="Jane Doe"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error ? (
                <p className="text-sm text-pretty text-destructive">{error}</p>
              ) : null}

              <Button
                type="submit"
                disabled={!canGenerate || generating}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating agreement
                  </>
                ) : (
                  "Continue to signing"
                )}
              </Button>

              <p className="text-sm text-pretty text-muted-foreground">
                The agreement will be prepared with the approved amount, APR,
                term, and monthly payment shown on this page.
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
