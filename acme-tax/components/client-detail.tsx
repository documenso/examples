"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileSpreadsheet, Send } from "lucide-react"

import { SigningFlow } from "@/components/signing-flow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PageShell } from "@/components/page-shell"
import { Separator } from "@/components/ui/separator"
import { useClientStatuses } from "@/hooks/use-client-statuses"
import { formatCurrency } from "@/lib/mock-data"
import type { ClientStatus, TaxClient } from "@/lib/mock-data"

export function ClientDetail({ client }: { client: TaxClient }) {
  const { statuses } = useClientStatuses()
  const status = statuses[client.id] ?? client.status
  const [isSigningDialogOpen, setIsSigningDialogOpen] = useState(false)

  return (
    <Dialog open={isSigningDialogOpen} onOpenChange={setIsSigningDialogOpen}>
      <PageShell>
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-sm text-muted-foreground">{client.email}</p>
          </div>
          <Form8879Badge status={status} />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Filing Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{client.filingStatus}</p>
              <p className="mt-1 text-sm text-muted-foreground">Tax Year 2025</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {client.refundAmount < 0 ? "Amount Owed" : "Refund Amount"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-lg font-semibold ${
                  client.refundAmount < 0
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {formatCurrency(client.refundAmount)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {client.refundAmount < 0 ? "Due to IRS" : "Federal refund"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Income Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Gross Income
              </span>
              <span className="font-medium">{formatCurrency(client.income)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Preparer</span>
              <span className="font-medium">{client.preparerName}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <DialogTrigger
            render={<Button size="lg" className="gap-2" />}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Send 8879 for Signing
          </DialogTrigger>
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            nativeButton={false}
            render={<Link href={`/clients/${client.id}/compose`} />}
          >
            <Send className="h-4 w-4" />
            Send Custom Document
          </Button>
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
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
        8879 Signed
      </Badge>
    )
  }

  if (status === "pending") {
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
        8879 Pending
      </Badge>
    )
  }

  return <Badge variant="secondary">8879 Not Sent</Badge>
}
