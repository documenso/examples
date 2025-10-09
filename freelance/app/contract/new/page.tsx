"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, X, ArrowRight, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useApplications, useJob, queryKeys } from "@/lib/queries"
import { useUser } from "@/lib/user-context"
import { useQueryClient } from "@tanstack/react-query"

interface Milestone {
  title: string
  description: string
  amount: string
  dueDate: string
}

export default function NewContractPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { userId } = useUser()
  const applicationId = searchParams.get("applicationId")

  const { data: applications = [], isLoading: appsLoading } = useApplications()
  const application = applications.find((a) => a.id === applicationId)
  const { data: job, isLoading: jobLoading } = useJob(application?.jobId || "")
  const loading = appsLoading || jobLoading

  const [milestones, setMilestones] = useState<Milestone[]>([{ title: "", description: "", amount: "", dueDate: "" }])
  const [isCreating, setIsCreating] = useState(false)

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", description: "", amount: "", dueDate: "" }])
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones]
    updated[index][field] = value
    setMilestones(updated)
  }

  const totalAmount = milestones.reduce((sum, m) => sum + (Number.parseFloat(m.amount) || 0), 0)

  const handleCreateContract = async () => {
    if (!userId || !application || !job) {
      alert("Missing required information")
      return
    }

    for (const milestone of milestones) {
      if (!milestone.title || !milestone.description || !milestone.amount || !milestone.dueDate) {
        alert("Please fill in all milestone fields")
        return
      }
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          clientId: userId,
          freelancerId: application.freelancer.id,
          milestones: milestones,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create contract")
      }

      const contract = await response.json()

      // Update application status to accepted
      await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "accepted",
        }),
      })

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: queryKeys.contracts() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.jobs })

      router.push(`/contract/sign/${contract.id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create contract. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!application || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Application not found</h1>
          <Button asChild className="mt-4">
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Contract</h1>
          <p className="mt-2 text-muted-foreground">Define milestones and payment terms for this project</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Job Title</Label>
                  <p className="mt-1 font-medium">{job.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Freelancer</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={application.freelancer.avatar || "/placeholder.svg"}
                        alt={application.freelancer.name}
                      />
                      <AvatarFallback>{application.freelancer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{application.freelancer.name}</p>
                      <p className="text-sm text-muted-foreground">{application.freelancer.title}</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Agreed Budget</Label>
                    <p className="mt-1 font-medium">${application.proposedBudget.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Duration</Label>
                    <p className="mt-1 font-medium">{application.proposedDuration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Milestones</CardTitle>
                    <CardDescription>Break down the project into milestones with payment amounts</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={addMilestone}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={index} className="space-y-4 rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Milestone {index + 1}</h4>
                      {milestones.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeMilestone(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${index}`}>Title</Label>
                        <Input
                          id={`title-${index}`}
                          placeholder="e.g., Project Setup & Architecture"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, "title", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`description-${index}`}>Description</Label>
                        <Textarea
                          id={`description-${index}`}
                          placeholder="Describe what will be delivered in this milestone..."
                          rows={3}
                          value={milestone.description}
                          onChange={(e) => updateMilestone(index, "description", e.target.value)}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`amount-${index}`}>Payment Amount</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              id={`amount-${index}`}
                              type="number"
                              placeholder="2000"
                              className="pl-7"
                              value={milestone.amount}
                              onChange={(e) => updateMilestone(index, "amount", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`dueDate-${index}`}>Due Date</Label>
                          <Input
                            id={`dueDate-${index}`}
                            type="date"
                            value={milestone.dueDate}
                            onChange={(e) => updateMilestone(index, "dueDate", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
                  <span className="font-medium">Total Contract Value</span>
                  <span className="text-2xl font-bold">${totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={handleCreateContract} disabled={isCreating}>
              {isCreating ? "Creating Contract..." : "Create Contract & Proceed to Signing"}
              {!isCreating && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contract Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-muted-foreground">Both parties must sign the contract before work begins</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-muted-foreground">Payments are released upon milestone completion</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-muted-foreground">Contracts are legally binding and protected</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-muted-foreground">Dispute resolution available through platform</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    1
                  </div>
                  <p className="text-muted-foreground">Review and create contract with milestones</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    2
                  </div>
                  <p className="text-muted-foreground">Sign the contract using embedded Documenso</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    3
                  </div>
                  <p className="text-muted-foreground">Freelancer receives and signs the contract</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    4
                  </div>
                  <p className="text-muted-foreground">Work begins and milestones are tracked</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
