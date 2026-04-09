"use client"

import Link from "next/link"
import { Calculator } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useClientStatuses } from "@/hooks/use-client-statuses"
import { clients, formatCurrency } from "@/lib/mock-data"
import type { ClientStatus } from "@/lib/mock-data"
import { PageShell } from "@/components/page-shell"

const statusConfig: Record<
  ClientStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  not_sent: { label: "8879 Not Sent", variant: "secondary" },
  pending: { label: "8879 Pending", variant: "outline" },
  signed: { label: "8879 Signed", variant: "default" },
}

export function DashboardClient() {
  const { statuses } = useClientStatuses()

  return (
    <PageShell>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Acme Tax</h1>
          <p className="text-sm text-muted-foreground">
            Tax Year 2025 — Client Portal
          </p>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Filing Status</TableHead>
              <TableHead className="text-right">Refund / Owed</TableHead>
              <TableHead className="text-right">8879 Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const status = statuses[client.id] ?? client.status
              const config = statusConfig[status]

              return (
                <TableRow key={client.id}>
                  <TableCell>
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.filingStatus}
                  </TableCell>
                  <TableCell className="text-right">
                    {client.refundAmount < 0 ? (
                      <span className="text-destructive">
                        Owes {formatCurrency(client.refundAmount)}
                      </span>
                    ) : (
                      <span className="text-primary">
                        Refund {formatCurrency(client.refundAmount)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={status} config={config} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  )
}

function StatusBadge({
  status,
  config,
}: {
  status: ClientStatus
  config: { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
}) {
  if (status === "signed") {
    return <Badge>{config.label}</Badge>
  }

  if (status === "pending") {
    return <Badge variant="secondary">{config.label}</Badge>
  }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
