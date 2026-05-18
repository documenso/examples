"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/mock-data"

type ScopeChangeActionsProps = {
  projectId: string
  projectName: string
  clientName: string
  clientEmail: string
  scopeChangeId: string
  changeDescription: string
  budgetImpact: number
  currentBudget: number
  onDocumentCreated?: (documentId: number) => void
}

export function ScopeChangeActions({
  projectId,
  projectName,
  clientName,
  clientEmail,
  scopeChangeId,
  changeDescription,
  budgetImpact,
  currentBudget,
  onDocumentCreated,
}: ScopeChangeActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          scopeChangeId,
          currentBudget,
        }),
      })

      if (!res.ok) throw new Error("Failed to create change order")

      const data = await res.json()
      onDocumentCreated?.(data.documentId)
      setOpen(false)
      router.push(
        `/projects/${projectId}/sign?token=${encodeURIComponent(data.signingToken)}&flow=change-order&documentId=${data.documentId}&scopeChangeId=${scopeChangeId}&amount=${budgetImpact}`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="shrink-0 rounded-lg" />
        }
      >
        Send change order
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send change order</DialogTitle>
          <DialogDescription>
            Create a change order for {projectName} and send it to the client
            for signature.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-1">
          <div className="space-y-1">
            <p className="text-sm font-medium">{changeDescription}</p>
            <p className="text-sm text-muted-foreground">
              <span className="tabular-nums">
                {formatCurrency(budgetImpact)}
              </span>{" "}
              will be added once the change order is signed.
            </p>
          </div>

          <dl className="grid gap-4 border-y border-zinc-950/10 py-4 text-sm dark:border-white/10">
            <div className="flex items-start justify-between gap-4">
              <dt className="font-medium text-foreground">Client</dt>
              <dd className="text-right text-muted-foreground">
                <span className="block text-foreground">{clientName}</span>
                <span>{clientEmail}</span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-medium text-foreground">Current budget</dt>
              <dd className="text-muted-foreground tabular-nums">
                {formatCurrency(currentBudget)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-medium text-foreground">Change order</dt>
              <dd className="text-muted-foreground tabular-nums">
                {formatCurrency(budgetImpact)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-medium text-foreground">
                New total after signing
              </dt>
              <dd className="font-medium text-foreground tabular-nums">
                {formatCurrency(currentBudget + budgetImpact)}
              </dd>
            </div>
          </dl>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter showCloseButton>
          <Button
            onClick={handleSend}
            disabled={loading}
            className="rounded-lg"
          >
            {loading ? "Sending…" : "Send for signature"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
