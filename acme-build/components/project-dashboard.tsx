"use client"

import { type CSSProperties, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  type Subcontractor,
  PAY_PERIOD,
  PROJECT_BUDGET,
  PROJECT_COMPLETION_PERCENT,
  PROJECT_NAME,
  subcontractors as initialSubs,
  formatCurrency,
} from "@/lib/mock-data"
import { readWaiverSession, writeWaiverSession } from "@/lib/waiver-session"

export function ProjectDashboard() {
  const router = useRouter()
  const [subs, setSubs] = useState<Subcontractor[]>(initialSubs)
  const [selectedSub, setSelectedSub] = useState<Subcontractor | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const signedCount = subs.filter((sub) => sub.waiverStatus === "signed").length
  const totalPending = subs
    .filter((sub) => sub.paymentStatus === "pending")
    .reduce((total, sub) => total + sub.amount, 0)

  useEffect(() => {
    setSubs((prev) =>
      prev.map((s) => {
        const session = readWaiverSession(s.id)

        if (session) {
          return {
            ...s,
            waiverStatus: session.waiverStatus,
            paymentStatus: session.paymentStatus,
          }
        }

        return s
      })
    )
  }, [])

  async function handleSendWaiver() {
    if (!selectedSub || !email.trim()) {
      return
    }

    setSending(true)
    setError(null)

    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimantName: selectedSub.name,
          email: email.trim(),
          projectName: PROJECT_NAME,
          payPeriodLabel: PAY_PERIOD.label,
          payPeriodStart: PAY_PERIOD.startDate,
          payPeriodEnd: PAY_PERIOD.endDate,
          paymentAmount: selectedSub.amount,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to generate document")

      setSubs((prev) =>
        prev.map((s) =>
          s.id === selectedSub.id ? { ...s, waiverStatus: "sent" as const } : s
        )
      )

      writeWaiverSession(selectedSub.id, {
        documentId: data.documentId,
        signingToken: data.signingToken,
        signerEmail: email.trim(),
        waiverStatus: "sent",
        paymentStatus: "pending",
      })

      setDialogOpen(false)
      setEmail("")
      router.push(`/sign/${selectedSub.id}`)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create waiver from template"
      )
    } finally {
      setSending(false)
    }
  }

  function openWaiverDialog(sub: Subcontractor) {
    setSelectedSub(sub)
    setEmail("")
    setError(null)
    setDialogOpen(true)
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    setDialogOpen(nextOpen)

    if (!nextOpen) {
      setEmail("")
      setError(null)
    }
  }

  return (
    <div className="isolate min-h-svh bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 lg:px-8">
        <section className="grid gap-12 border-b border-zinc-950/5 pb-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
          <div className="flex flex-col gap-4">
            <p className="text-base font-medium text-zinc-500 sm:text-sm">
              Construction payment control
            </p>
            <div className="flex flex-col gap-3">
              <h1 className="max-w-[24ch] text-4xl font-semibold tracking-tight text-balance">
                {PROJECT_NAME}
              </h1>
              <p className="max-w-[56ch] text-base text-pretty text-zinc-600 sm:text-sm">
                Manage conditional lien waivers for the current draw, keep every
                subcontractor moving, and release payment only after signing is
                complete.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-zinc-950/5 pt-5 lg:pl-10">
            <div className="flex flex-col gap-2">
              <p className="text-base font-medium text-zinc-500 sm:text-sm">
                Current draw
              </p>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-lg font-medium tabular-nums text-zinc-950 sm:text-base">
                  {PAY_PERIOD.displayRange}
                </p>
                <p className="text-base text-zinc-500 sm:text-sm">
                  {PAY_PERIOD.label}
                </p>
              </div>
            </div>
            <dl className="grid gap-4 border-t border-zinc-950/5 pt-4">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base font-medium text-zinc-500 sm:text-sm">
                  Pending release
                </dt>
                <dd className="text-base font-medium tabular-nums text-zinc-950 sm:text-sm">
                  {formatCurrency(totalPending)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base font-medium text-zinc-500 sm:text-sm">
                  Signed waivers
                </dt>
                <dd className="text-base font-medium tabular-nums text-zinc-950 sm:text-sm">
                  {signedCount} of {subs.length}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="grid gap-6 border-b border-zinc-950/5 pb-10 sm:grid-cols-3">
          <div className="sm:pr-6 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-zinc-950/5 sm:[&:not(:first-child)]:pl-6">
            <p className="truncate text-base font-medium text-zinc-500 sm:text-sm">
              Total budget
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-zinc-950">
              {formatCurrency(PROJECT_BUDGET)}
            </p>
          </div>
          <div className="border-t border-zinc-950/5 pt-6 sm:border-t-0 sm:px-6 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-zinc-950/5">
            <p className="truncate text-base font-medium text-zinc-500 sm:text-sm">
              Completion
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-zinc-950">
              {PROJECT_COMPLETION_PERCENT}%
            </p>
            <div className="mt-4 h-2 rounded-full bg-zinc-950/8">
              <div
                className="h-2 w-(--completion) rounded-full bg-primary"
                style={
                  {
                    "--completion": `${PROJECT_COMPLETION_PERCENT}%`,
                  } as CSSProperties
                }
              />
            </div>
          </div>
          <div className="border-t border-zinc-950/5 pt-6 sm:border-t-0 sm:pl-6 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-zinc-950/5">
            <p className="truncate text-base font-medium text-zinc-500 sm:text-sm">
              Subcontractors
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-zinc-950">
              {subs.length}
            </p>
            <p className="mt-2 text-base text-pretty text-zinc-600 sm:text-sm">
              {signedCount} signed and ready to release.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="max-w-[30ch] text-2xl font-semibold tracking-tight text-balance">
              Subcontractor releases
            </h2>
            <p className="max-w-[56ch] text-base text-pretty text-zinc-600 sm:text-sm">
              Create waivers, route each subcontractor into embedded signing,
              and keep payment status aligned with document completion for pay
              period {PAY_PERIOD.displayRange}.
            </p>
          </div>

          <div className="-mx-6 -my-2 overflow-x-auto whitespace-nowrap lg:-mx-8">
            <div className="inline-block min-w-full px-6 py-2 align-middle lg:px-8">
              <table className="w-full text-left text-base sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-950/10">
                    <th className="h-12 pr-4 font-medium whitespace-nowrap text-zinc-500">
                      Subcontractor
                    </th>
                    <th className="h-12 px-4 font-medium whitespace-nowrap text-zinc-500">
                      Trade
                    </th>
                    <th className="h-12 px-4 text-right font-medium whitespace-nowrap text-zinc-500">
                      Amount
                    </th>
                    <th className="h-12 px-4 font-medium whitespace-nowrap text-zinc-500">
                      Waiver
                    </th>
                    <th className="h-12 px-4 font-medium whitespace-nowrap text-zinc-500">
                      Payment
                    </th>
                    <th className="h-12 pl-4 text-right font-medium whitespace-nowrap text-zinc-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-zinc-950/5 transition-colors hover:bg-zinc-50/80"
                    >
                      <td className="py-4 pr-4 align-middle font-medium text-zinc-950">
                        {sub.name}
                      </td>
                      <td className="px-4 py-4 align-middle text-zinc-600">
                        {sub.trade}
                      </td>
                      <td className="px-4 py-4 text-right align-middle font-medium tabular-nums text-zinc-950">
                        {formatCurrency(sub.amount)}
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <WaiverBadge status={sub.waiverStatus} />
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <PaymentBadge status={sub.paymentStatus} />
                      </td>
                      <td className="py-4 pl-4 text-right align-middle">
                        {sub.waiverStatus === "not-sent" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openWaiverDialog(sub)}
                          >
                            Send waiver
                          </Button>
                        )}
                        {sub.waiverStatus === "sent" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/sign/${sub.id}`)}
                          >
                            Continue signing
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Lien Waiver</DialogTitle>
            <DialogDescription>
              Create a waiver from the project template for {selectedSub?.name}.
              The document opens immediately for embedded signing and payment
              remains pending until the waiver is completed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subcontractor">Subcontractor</Label>
              <Input
                id="subcontractor"
                name="subcontractor"
                value={selectedSub?.name ?? ""}
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  value={selectedSub ? formatCurrency(selectedSub.amount) : ""}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pay-period">Pay period</Label>
                <Input
                  id="pay-period"
                  name="payPeriod"
                  value={PAY_PERIOD.displayRange}
                  disabled
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Signer Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="signer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendWaiver}
              disabled={!email.trim() || sending}
            >
              {sending ? "Creating…" : "Create & Open Waiver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WaiverBadge({ status }: { status: Subcontractor["waiverStatus"] }) {
  switch (status) {
    case "signed":
      return <Badge variant="default">Signed</Badge>
    case "sent":
      return <Badge variant="secondary">Sent</Badge>
    default:
      return <Badge variant="outline">Not Sent</Badge>
  }
}

function PaymentBadge({ status }: { status: Subcontractor["paymentStatus"] }) {
  if (status === "released") {
    return <Badge variant="default">Released</Badge>
  }
  return <Badge variant="outline">Pending</Badge>
}
