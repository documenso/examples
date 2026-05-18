"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

const REVENUE_OPTIONS = [
  { value: "under-500k", label: "Under $500K" },
  { value: "500k-1m", label: "$500K – $1M" },
  { value: "1m-5m", label: "$1M – $5M" },
  { value: "5m-plus", label: "$5M+" },
]

const PURPOSE_OPTIONS = [
  { value: "equipment", label: "Equipment" },
  { value: "inventory", label: "Inventory" },
  { value: "working-capital", label: "Working Capital" },
  { value: "expansion", label: "Expansion" },
]

export default function ApplyPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState("")
  const [revenue, setRevenue] = useState("")
  const [loanAmount, setLoanAmount] = useState(25000)
  const [purpose, setPurpose] = useState("")

  const canSubmit = Boolean(businessName.trim() && revenue && purpose)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const params = new URLSearchParams({
      businessName,
      revenue,
      loanAmount: String(loanAmount),
      purpose,
    })
    router.push(`/approved?${params.toString()}`)
  }

  return (
    <div className="bg-background">
      <main className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[21fr_19fr] lg:gap-16">
          <section className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">
                Acme Lending
              </p>
              <div className="space-y-4">
                <h1 className="max-w-[24ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  Simple capital for businesses that need to move now.
                </h1>
                <p className="max-w-[56ch] text-base text-muted-foreground text-pretty">
                  Share a few details about your business and we&apos;ll match
                  you with a clear offer in minutes.
                </p>
              </div>
            </div>

            <div className="grid gap-4 py-5 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Decision time</p>
                <p className="text-lg font-semibold tracking-tight tabular-nums">
                  24 hours
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loan range</p>
                <p className="text-lg font-semibold tracking-tight tabular-nums">
                  $5K–$100K
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Credit impact</p>
                <p className="text-lg font-semibold tracking-tight">
                  No hard pull
                </p>
              </div>
            </div>

            <ul role="list" className="grid gap-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-4 shrink-0 stroke-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Clear loan structure</p>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Simple repayment terms with no surprise fees buried in the
                    fine print.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock3 className="size-4 shrink-0 stroke-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Fast underwriting</p>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Built for operators who need to act quickly on inventory,
                    equipment, or working capital.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="size-4 shrink-0 stroke-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">A clean application flow</p>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Start with the basics now and finalize your agreement only
                    after you review the offer.
                  </p>
                </div>
              </li>
            </ul>
          </section>

          <section className="rounded-4xl bg-muted/30 p-6 sm:p-8">
            <div className="space-y-2">
              <h2 className="max-w-[30ch] text-2xl font-semibold tracking-tight text-balance">
                Start your application
              </h2>
              <p className="max-w-[48ch] text-sm text-muted-foreground text-pretty">
                Enter your business details to check your rate.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder="Acme Corp"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenue">Annual revenue</Label>
                <Select
                  name="revenue"
                  value={revenue}
                  onValueChange={(v) => setRevenue(v ?? "")}
                  required
                >
                  <SelectTrigger id="revenue" className="w-full">
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    {REVENUE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">Loan amount</p>
                  <p
                    className="text-lg font-semibold tracking-tight tabular-nums text-primary"
                  >
                    ${loanAmount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-3xl bg-muted/50 px-4 py-4">
                  <div className="mb-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
                    <span className="tabular-nums">$5,000</span>
                    <span className="tabular-nums">$100,000</span>
                  </div>
                  <Slider
                    aria-label="Loan amount"
                    min={5000}
                    max={100000}
                    step={1000}
                    value={[loanAmount]}
                    onValueChange={(v) =>
                      setLoanAmount(Array.isArray(v) ? v[0] : v)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Loan purpose</Label>
                <Select
                  name="purpose"
                  value={purpose}
                  onValueChange={(v) => setPurpose(v ?? "")}
                  required
                >
                  <SelectTrigger id="purpose" className="w-full">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <Button type="submit" disabled={!canSubmit} className="w-full" size="lg">
                  Continue
                </Button>
                <p className="text-sm text-muted-foreground text-pretty">
                  Checking your rate won&apos;t affect your credit score.
                </p>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
