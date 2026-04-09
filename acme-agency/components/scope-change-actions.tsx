"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/mock-data"

type ScopeChangeActionsProps = {
  projectId: string
  projectName: string
  changeDescription: string
  budgetImpact: number
}

export function ScopeChangeActions({
  projectId,
  projectName,
  changeDescription,
  budgetImpact,
}: ScopeChangeActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!name.trim() || !email.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          projectName,
          changeDescription,
          budgetImpact,
        }),
      })

      if (!res.ok) throw new Error("Failed to create change order")

      const data = await res.json()
      setOpen(false)
      router.push(
        `/projects/${projectId}/sign?token=${data.signingToken}`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" variant="outline" className="shrink-0">
          <Send className="mr-1.5 h-3.5 w-3.5" />
          Send Change Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Change Order</DialogTitle>
          <DialogDescription>
            {changeDescription} — {formatCurrency(budgetImpact)} budget impact
            for {projectName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="co-name">Recipient Name</Label>
            <Input
              id="co-name"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="co-email">Recipient Email</Label>
            <Input
              id="co-email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSend}
            disabled={loading || !name.trim() || !email.trim()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send & Sign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
