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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type StartOnboardingDialogProps = {
  prospectId: string
  clientName: string
  aumLabel: string
  feeLabel: string
}

export function StartOnboardingDialog({
  prospectId,
  clientName,
  aumLabel,
  feeLabel,
}: StartOnboardingDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStartOnboarding() {
    if (!email) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/start-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          clientName,
          email,
          aum: aumLabel,
          fee: feeLabel,
        }),
      })

      const payload = (await response.json().catch(() => null)) as {
        error?: string
        sessionId?: string
      } | null

      if (!response.ok || !payload?.sessionId) {
        throw new Error(payload?.error || "Failed to start onboarding")
      }

      setOpen(false)
      router.push(`/clients/${payload.sessionId}/onboarding`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start onboarding"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setError(null)
        }
      }}
    >
      <DialogTrigger render={<Button className="w-full" />}>
        Launch onboarding
      </DialogTrigger>
      <DialogContent className="gap-8 rounded-2xl p-8 sm:max-w-xl">
        <DialogHeader className="gap-3">
          <DialogTitle className="max-w-[22ch] text-xl text-balance">
            Launch the advisory packet for {clientName}
          </DialogTitle>
          <DialogDescription className="text-base text-pretty">
            Meridian will create the full packet and move the household into the
            live signing sequence as soon as you confirm the signer email.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="border-y border-border/70">
            <div className="flex items-center justify-between gap-4 py-4">
              <p className="text-sm text-muted-foreground">
                Assets under management
              </p>
              <p className="text-sm font-medium text-foreground tabular-nums">
                {aumLabel}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border/70 py-4">
              <p className="text-sm text-muted-foreground">Effective fee</p>
              <p className="text-sm font-medium text-foreground tabular-nums">
                {feeLabel}
              </p>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-border/70 py-4">
              <p className="text-sm text-muted-foreground">Packet includes</p>
              <p className="max-w-[22ch] text-right text-sm font-medium text-foreground">
                Investment Management Agreement, Fee Acknowledgment, ADV Part 2
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="client-email">Email address</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="client@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              This signer will receive and complete the packet in sequence.
            </p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleStartOnboarding} disabled={!email || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 shrink-0 animate-spin" />
                Creating packet...
              </>
            ) : (
              "Start packet"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
