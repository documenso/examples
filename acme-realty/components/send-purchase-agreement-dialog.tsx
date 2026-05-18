"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
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

interface SendPurchaseAgreementDialogProps {
  transactionId: string
  property: string
  buyerName: string
  sellerName: string
  buyerEmail: string | null
  sellerEmail: string | null
  className?: string
}

export function SendPurchaseAgreementDialog({
  transactionId,
  property,
  buyerName,
  sellerName,
  buyerEmail,
  sellerEmail,
  className,
}: SendPurchaseAgreementDialogProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentBuyerEmail, setCurrentBuyerEmail] = useState(buyerEmail ?? "")
  const [currentSellerEmail, setCurrentSellerEmail] = useState(
    sellerEmail ?? "",
  )
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendAgreement() {
    setSending(true)
    setError(null)

    try {
      const response = await fetch("/api/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          buyerEmail: currentBuyerEmail,
          sellerEmail: currentSellerEmail,
        }),
      })

      const data = (await response.json()) as { error?: string; id?: string }

      if (!response.ok || !data.id) {
        setError(data.error ?? "Failed to send the purchase agreement.")
        return
      }

      setDialogOpen(false)
      router.push(`/transactions/${data.id}/sign`)
      router.refresh()
    } catch (caughtError) {
      console.error("Failed to send purchase agreement:", caughtError)
      setError("Failed to send the purchase agreement.")
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Button type="button" className={className} onClick={() => setDialogOpen(true)}>
        Send Purchase Agreement
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Purchase Agreement</DialogTitle>
            <DialogDescription>
              Confirm the signer details for {property}. The purchase agreement
              will route to both parties immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buyer-email">Buyer email</Label>
              <Input
                id="buyer-email"
                name="buyerEmail"
                type="email"
                aria-label={`Buyer email for ${buyerName}`}
                placeholder={`${buyerName} · buyer@email.com`}
                value={currentBuyerEmail}
                onChange={(event) => setCurrentBuyerEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-email">Seller email</Label>
              <Input
                id="seller-email"
                name="sellerEmail"
                type="email"
                aria-label={`Seller email for ${sellerName}`}
                placeholder={`${sellerName} · seller@email.com`}
                value={currentSellerEmail}
                onChange={(event) => setCurrentSellerEmail(event.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendAgreement}
              disabled={!currentBuyerEmail || !currentSellerEmail || sending}
            >
              {sending ? (
                <>
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  Sending agreement
                </>
              ) : (
                "Send agreement"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
