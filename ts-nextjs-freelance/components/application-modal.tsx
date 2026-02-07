"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Job } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries"

interface ApplicationModalProps {
  job: Job
  isOpen: boolean
  onClose: () => void
}

export function ApplicationModal({ job, isOpen, onClose }: ApplicationModalProps) {
  const router = useRouter()
  const { userId } = useUser()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    coverLetter: "",
    proposedBudget: "",
    proposedDuration: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      alert("You must be logged in to submit an application")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          freelancerId: userId,
          coverLetter: formData.coverLetter,
          proposedBudget: formData.proposedBudget,
          proposedDuration: formData.proposedDuration,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit application")
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      await queryClient.invalidateQueries({ queryKey: queryKeys.job(job.id) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications({ jobId: job.id }) })

      onClose()
      alert("Application submitted successfully!")
      router.push("/dashboard")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to submit application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Your Proposal</DialogTitle>
          <DialogDescription>
            Apply for: <span className="font-medium text-foreground">{job.title}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              placeholder="Explain why you're the best fit for this job. Highlight your relevant experience and skills..."
              rows={8}
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              A strong cover letter increases your chances of getting hired
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="proposedBudget">Your Proposed {job.budget.type === "fixed" ? "Budget" : "Rate"}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="proposedBudget"
                  type="number"
                  placeholder={job.budget.type === "fixed" ? "7500" : "75"}
                  className="pl-7"
                  value={formData.proposedBudget}
                  onChange={(e) => setFormData({ ...formData, proposedBudget: e.target.value })}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Client&apos;s budget: ${job.budget.min.toLocaleString()}-${job.budget.max.toLocaleString()}
                {job.budget.type === "hourly" && "/hr"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposedDuration">Estimated Duration</Label>
              <Input
                id="proposedDuration"
                placeholder="e.g., 2 months"
                value={formData.proposedDuration}
                onChange={(e) => setFormData({ ...formData, proposedDuration: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Client expects: {job.duration}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Application Tips</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Personalize your cover letter for this specific job</li>
              <li>• Highlight relevant experience and past projects</li>
              <li>• Be realistic with your budget and timeline</li>
              <li>• Respond promptly if the client messages you</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Proposal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
