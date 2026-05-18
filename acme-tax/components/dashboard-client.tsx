"use client"

import Link from "next/link"

import { useClientStatuses } from "@/hooks/use-client-statuses"
import { clients, formatCurrency } from "@/lib/mock-data"
import type { ClientStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { PageShell } from "@/components/page-shell"

const statusConfig: Record<
  ClientStatus,
  { label: string; dotClassName: string }
> = {
  not_sent: { label: "Ready to send", dotClassName: "bg-zinc-400" },
  pending: { label: "Awaiting signature", dotClassName: "bg-amber-500" },
  signed: { label: "Signed", dotClassName: "bg-emerald-500" },
}

export function DashboardClient() {
  const { statuses } = useClientStatuses()
  const clientsWithStatus = clients.map((client) => ({
    ...client,
    resolvedStatus: statuses[client.id] ?? client.status,
  }))
  const totalRefunds = clientsWithStatus.reduce(
    (total, client) => total + Math.max(client.refundAmount, 0),
    0
  )
  const pendingSignatures = clientsWithStatus.filter(
    (client) => client.resolvedStatus === "pending"
  ).length
  const readyToSend = clientsWithStatus.filter(
    (client) => client.resolvedStatus === "not_sent"
  ).length
  const summaryItems = [
    {
      label: "Clients",
      value: String(clientsWithStatus.length),
      detail: `${readyToSend} still need Form 8879 sent`,
    },
    {
      label: "Awaiting signature",
      value: String(pendingSignatures),
      detail: "Returns waiting on final client approval",
    },
    {
      label: "Projected refunds",
      value: formatCurrency(totalRefunds),
      detail: "Combined federal refunds across this list",
    },
  ]

  return (
    <PageShell>
      <header className="border-b border-border/70 pb-8">
        <p className="text-sm font-medium text-muted-foreground">
          Tax year 2025
        </p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-[20ch] text-4xl font-semibold tracking-tight text-balance">
              Acme Tax client portal
            </h1>
            <p className="mt-3 max-w-[56ch] text-base text-pretty text-muted-foreground">
              Review each return, send Form 8879 for signature, and keep custom
              document work moving in one place.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Prepared by Robert Martinez, CPA
          </p>
        </div>
      </header>

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
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">
              {item.detail}
            </p>
          </div>
        ))}
      </section>

      <section className="pt-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-balance">Client list</h2>
          <p className="max-w-[56ch] text-base text-pretty text-muted-foreground">
            Select a client to review return details or trigger the next step in
            the filing workflow.
          </p>
        </div>

        <div className="-mx-4 -my-2 mt-4 overflow-x-auto whitespace-nowrap sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full px-4 py-2 align-middle sm:px-6 lg:px-8">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/70">
                <tr>
                  <th className="h-12 py-3 pr-3 font-medium whitespace-nowrap text-foreground">
                    Client
                  </th>
                  <th className="h-12 px-3 font-medium whitespace-nowrap text-foreground">
                    Filing status
                  </th>
                  <th className="h-12 px-3 text-right font-medium whitespace-nowrap text-foreground">
                    Refund / owed
                  </th>
                  <th className="h-12 py-3 pl-3 text-right font-medium whitespace-nowrap text-foreground">
                    8879 status
                  </th>
                </tr>
              </thead>
              <tbody>
                {clientsWithStatus.map((client) => {
                  const config = statusConfig[client.resolvedStatus]

                  return (
                    <tr
                      key={client.id}
                      className="border-b border-border/70 transition-colors hover:bg-muted/20"
                    >
                      <td className="py-4 pr-3 align-middle">
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {client.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {client.email}
                        </p>
                      </td>
                      <td className="px-3 py-4 align-middle text-muted-foreground">
                        {client.filingStatus}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-4 text-right align-middle font-medium tabular-nums",
                          client.refundAmount < 0
                            ? "text-destructive"
                            : "text-emerald-600"
                        )}
                      >
                        {client.refundAmount < 0 ? "Owes " : "Refund "}
                        {formatCurrency(client.refundAmount)}
                      </td>
                      <td className="py-4 pl-3 align-middle">
                        <span className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                          <span
                            aria-hidden="true"
                            className={cn(
                              "size-2 rounded-full",
                              config.dotClassName
                            )}
                          />
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
