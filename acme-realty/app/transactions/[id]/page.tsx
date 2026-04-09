"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Building,
  ArrowLeft,
  FileText,
  FilePlus,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { TRANSACTIONS } from "@/lib/mock-data"

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  under_contract: "Under Contract",
  closed: "Closed",
}

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const txn = TRANSACTIONS.find((t) => t.id === id)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [buyerEmail, setBuyerEmail] = useState("")
  const [sellerEmail, setSellerEmail] = useState("")
  const [sending, setSending] = useState(false)

  if (!txn) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Transaction not found</p>
      </div>
    )
  }

  const isDraft = txn.status === "draft"
  const isClosed = txn.status === "closed"

  async function handleSendAgreement() {
    setSending(true)
    try {
      const res = await fetch("/api/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyAddress: txn!.property,
          price: txn!.price,
          buyerName: txn!.buyerName,
          buyerEmail,
          sellerName: txn!.sellerName,
          sellerEmail,
        }),
      })

      if (!res.ok) {
        console.error("Failed to create transaction")
        return
      }

      const data = await res.json()
      router.push(`/transactions/${data.id}/sign`)
    } catch (err) {
      console.error("Error sending agreement:", err)
    } finally {
      setSending(false)
    }
  }

  // Mock document list based on status
  const documents = []
  if (!isDraft) {
    documents.push({
      name: "Purchase Agreement",
      signed: true,
    })
  }
  if (isClosed) {
    documents.push({
      name: "Closing Disclosure",
      signed: true,
    })
  }

  return (
    <div className="mx-auto min-h-svh max-w-3xl p-6 md:p-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/10">
          <Building className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {txn.property}
          </h1>
          <p className="text-sm text-muted-foreground">{txn.price}</p>
        </div>
        <Badge
          variant={isClosed ? "default" : "secondary"}
          className={
            isClosed
              ? "bg-emerald-600 text-white"
              : txn.status === "under_contract"
                ? "bg-amber-600/10 text-amber-600"
                : ""
          }
        >
          {STATUS_LABELS[txn.status]}
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Parties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Buyer</p>
              <p className="font-medium">{txn.buyerName}</p>
              {txn.buyerEmail && (
                <p className="text-muted-foreground">{txn.buyerEmail}</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Seller</p>
              <p className="font-medium">{txn.sellerName}</p>
              {txn.sellerEmail && (
                <p className="text-muted-foreground">{txn.sellerEmail}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No documents yet. Send a purchase agreement to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{doc.name}</span>
                  </div>
                  {doc.signed && (
                    <Badge variant="default" className="bg-emerald-600 text-white">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Signed
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {isDraft && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Purchase Agreement
          </Button>
        )}
        {!isClosed && (
          <Link
            href={`/transactions/${txn.id}/addendum`}
            className={buttonVariants({ variant: "outline" })}
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Add Custom Addendum
          </Link>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Purchase Agreement</DialogTitle>
            <DialogDescription>
              Enter email addresses for both parties to sign the purchase
              agreement for {txn.property}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="buyer-email">
                Buyer Email ({txn.buyerName})
              </Label>
              <Input
                id="buyer-email"
                type="email"
                placeholder="buyer@email.com"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-email">
                Seller Email ({txn.sellerName})
              </Label>
              <Input
                id="seller-email"
                type="email"
                placeholder="seller@email.com"
                value={sellerEmail}
                onChange={(e) => setSellerEmail(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendAgreement}
              disabled={!buyerEmail || !sellerEmail || sending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Agreement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
