"use client"

import { useState } from "react"
import Link from "next/link"

import { SigningFlow } from "@/components/signing-flow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PageShell } from "@/components/page-shell"
import { useClientStatuses } from "@/hooks/use-client-statuses"
import { formatCurrency } from "@/lib/mock-data"
import type { ClientStatus, TaxClient } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function ClientDetail({ client }: { client: TaxClient }) {
  const { statuses } = useClientStatuses()
  const status = statuses[client.id] ?? client.status
  const [isSigningDialogOpen, setIsSigningDialogOpen] = useState(false)
  const summaryItems = [
    {
      label: "Filing status",
      value: client.filingStatus,
      detail: "Federal return profile",
    },
    {
      label: client.refundAmount < 0 ? "Amount owed" : "Refund amount",
      value: formatCurrency(client.refundAmount),
      detail:
        client.refundAmount < 0
          ? "Due with the return"
          : "Projected federal refund",
      valueClassName:
        client.refundAmount < 0 ? "text-destructive" : "text-emerald-600",
    },
    {
      label: "Gross income",
      value: formatCurrency(client.income),
      detail: "Reported household income",
    },
  ]
  const details = [
    { term: "Client email", description: client.email },
    { term: "Tax year", description: "2025 individual return" },
    { term: "Preparer", description: client.preparerName },
    {
      term: "Form 8879",
      description:
        status === "signed"
          ? "Client has completed e-file authorization."
          : status === "pending"
            ? "Sent and waiting on client signature."
            : "Ready to send for signature.",
    },
  ]

  return (
    <Dialog open={isSigningDialogOpen} onOpenChange={setIsSigningDialogOpen}>
      <PageShell>
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Back to Dashboard
        </Link>

        <section className="border-b border-border/70 pt-6 pb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Client record
              </p>
              <h1 className="mt-3 max-w-[20ch] text-4xl font-semibold tracking-tight text-balance">
                {client.name}
              </h1>
              <p className="mt-3 max-w-[56ch] text-base text-pretty text-muted-foreground">
                Review filing details, send Form 8879, and prepare supporting
                documents for this return.
              </p>
            </div>
            <Form8879Badge status={status} />
          </div>
        </section>

        <section
          aria-label="Overview"
          className="grid border-b border-border/70 py-6 sm:grid-cols-3"
        >
          {summaryItems.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "py-4 sm:py-0",
                index > 0 &&
                  "border-t border-border/70 sm:border-t-0 sm:border-l",
                index === 0 && "sm:pr-6",
                index === 1 && "sm:px-6",
                index === 2 && "sm:pl-6"
              )}
            >
              <p className="truncate text-sm text-muted-foreground">
                {item.label}
              </p>
              <p
                className={cn(
                  "mt-2 text-3xl font-semibold tracking-tight tabular-nums",
                  item.valueClassName
                )}
              >
                {item.value}
              </p>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </section>

        <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:gap-12">
          <section>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-balance">
                Return details
              </h2>
              <p className="max-w-[56ch] text-base text-pretty text-muted-foreground">
                Core client details used during signature collection and custom
                document preparation.
              </p>
            </div>

            <dl className="mt-6 divide-y divide-border/70 border-y border-border/70">
              {details.map((item) => (
                <div
                  key={item.term}
                  className="grid gap-1 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="font-medium text-foreground">{item.term}</dt>
                  <dd className="text-pretty text-muted-foreground">
                    {item.description}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <aside className="border-t border-border/70 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-balance">Actions</h2>
              <p className="text-base text-pretty text-muted-foreground">
                Move this return forward with the next client-facing step.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <DialogTrigger render={<Button type="button" />}>
                Send 8879 for signing
              </DialogTrigger>
              <Link
                href={`/clients/${client.id}/compose`}
                className="inline-flex h-9 items-center justify-center rounded-4xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Send custom document
              </Link>
            </div>

            <p className="mt-4 text-sm text-pretty text-muted-foreground">
              Once Form 8879 is signed, the return is ready for final filing.
            </p>
          </aside>
        </div>
      </PageShell>

      <DialogContent className="p-0 sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Sign Form 8879</DialogTitle>
          <DialogDescription>
            Send IRS Form 8879 to {client.name} for electronic signature.
          </DialogDescription>
        </DialogHeader>
        <SigningFlow
          client={client}
          onRequestClose={() => setIsSigningDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function Form8879Badge({ status }: { status: ClientStatus }) {
  if (status === "signed") {
    return (
      <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        8879 Signed
      </Badge>
    )
  }

  if (status === "pending") {
    return (
      <Badge className="border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
        8879 Pending
      </Badge>
    )
  }

  return (
    <Badge className="border border-border bg-background text-foreground hover:bg-background">
      8879 Not Sent
    </Badge>
  )
}
