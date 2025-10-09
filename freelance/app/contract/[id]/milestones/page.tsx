"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Milestone } from "@/lib/types"
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  MessageSquare,
  FileText,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useState, use, useEffect } from "react"
import { useContract, useJob, useApplications } from "@/lib/queries"

export default function MilestonesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: contract, isLoading: contractLoading } = useContract(id)
  const { data: job, isLoading: jobLoading } = useJob(contract?.jobId || "")
  const { data: applications = [] } = useApplications(contract?.jobId ? { jobId: contract.jobId } : undefined)
  const application = applications[0]
  const loading = contractLoading || jobLoading

  const [milestones, setMilestones] = useState<Milestone[]>(contract?.milestones || [])

  useEffect(() => {
    if (contract?.milestones) {
      setMilestones(contract.milestones)
    }
  }, [contract])

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

  if (!contract || !job || !application) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Contract not found</h1>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const completedMilestones = milestones.filter((m) => m.status === "completed" || m.status === "paid").length
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0)
  const paidAmount = milestones.filter((m) => m.status === "paid").reduce((sum, m) => sum + m.amount, 0)
  const progressPercentage = (completedMilestones / milestones.length) * 100

  const handleMarkComplete = (milestoneId: string) => {
    setMilestones(milestones.map((m) => (m.id === milestoneId ? { ...m, status: "completed" as const } : m)))
  }

  const handleReleasePay = (milestoneId: string) => {
    setMilestones(milestones.map((m) => (m.id === milestoneId ? { ...m, status: "paid" as const } : m)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "paid":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "in-progress":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>        <div className="mb-8">
          <h1 className="text-3xl font-bold">Project Milestones</h1>
          <p className="mt-2 text-muted-foreground">{job.title}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">          <div className="space-y-6 lg:col-span-2">            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>
                  {completedMilestones} of {milestones.length} milestones completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>Total Value</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold">${totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Paid</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold">${paidAmount.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Remaining</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold">${(totalAmount - paidAmount).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <Card key={milestone.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{milestone.title}</CardTitle>
                            <CardDescription className="mt-1">{milestone.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(milestone.status)}>
                        {getStatusIcon(milestone.status)}
                        <span className="ml-1 capitalize">{milestone.status.replace("-", " ")}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium text-foreground">${milestone.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Due {new Date(milestone.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {milestone.status === "pending" && (
                      <div className="flex items-center gap-3 border-t border-border pt-4">
                        <Button size="sm" onClick={() => handleMarkComplete(milestone.id)}>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Complete
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Discuss
                        </Button>
                      </div>
                    )}

                    {milestone.status === "completed" && (
                      <div className="flex items-center gap-3 border-t border-border pt-4">
                        <Button size="sm" onClick={() => handleReleasePay(milestone.id)}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Release Payment
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Request Changes
                        </Button>
                      </div>
                    )}

                    {milestone.status === "paid" && (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Payment released on {new Date().toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>          <div className="space-y-6">            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Client</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={job.postedBy.avatar || "/placeholder.svg"} alt={job.postedBy.name} />
                      <AvatarFallback>{job.postedBy.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{job.postedBy.name}</p>
                      <p className="text-xs text-muted-foreground">Client</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Freelancer</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={application.freelancer.avatar || "/placeholder.svg"}
                        alt={application.freelancer.name}
                      />
                      <AvatarFallback>{application.freelancer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{application.freelancer.name}</p>
                      <p className="text-xs text-muted-foreground">{application.freelancer.title}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Contract ID</span>
                    <span className="font-medium">{contract.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="secondary">{contract.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span className="font-medium">{new Date(contract.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href={`/contract/sign/${contract.id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Contract
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Client
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {milestone.status === "paid" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-muted-foreground">M{index + 1}</span>
                      </div>
                      <span className="font-medium">${milestone.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
