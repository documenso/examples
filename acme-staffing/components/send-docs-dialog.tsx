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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Placement } from "@/lib/mock-data"
import { saveOnboardingState } from "@/hooks/use-placement-demo-state"

export function SendDocsDialog({ placement }: { placement: Placement }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [open, setOpen] = useState(false)

  function handleSend() {
    if (!email) return
    saveOnboardingState(placement.id, {
      email,
      candidateName: placement.candidateName,
      clientCompany: placement.clientCompany,
      role: placement.role,
      startDate: placement.startDate,
      hourlyRate: placement.hourlyRate,
    })
    setOpen(false)
    router.push(`/onboarding/${placement.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" type="button" />}>
        Send onboarding documents
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Send onboarding documents</DialogTitle>
          <DialogDescription>
            Enter the candidate&apos;s email address to send the contractor
            agreement and background check consent for signing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidate-name">Candidate</Label>
            <Input
              id="candidate-name"
              name="candidateName"
              value={placement.candidateName}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidate-email">Email Address</Label>
            <Input
              id="candidate-email"
              name="candidateEmail"
              type="email"
              placeholder="candidate@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSend} disabled={!email}>
            Send documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
