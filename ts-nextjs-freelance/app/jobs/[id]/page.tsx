"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Clock, DollarSign, Users, Star, Briefcase, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState, use } from "react"
import { ApplicationModal } from "@/components/application-modal"
import { useUser } from "@/lib/user-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useJob, useJobs, useApplications } from "@/lib/queries"

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const { isClient, isFreelancer, userId } = useUser()
  const { data: job, isLoading: loading } = useJob(id)
  const { data: allJobs = [] } = useJobs()
  const { data: applications = [] } = useApplications({ jobId: id })

  const hasApplied = applications.some((app) => app.freelancer.id === userId)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Job not found</h1>
          <Button asChild className="mt-4">
            <Link href="/">Browse Jobs</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-balance leading-tight">{job.title}</CardTitle>
                    <CardDescription className="mt-2">
                      Posted{" "}
                      {new Date(job.postedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Key Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-semibold">
                        {job.budget.type === "fixed"
                          ? `$${job.budget.min.toLocaleString()}-$${job.budget.max.toLocaleString()}`
                          : `$${job.budget.min}-$${job.budget.max}/hr`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold">{job.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Applicants</p>
                      <p className="font-semibold">{job.applicants}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="mb-3 font-semibold">Job Description</h3>
                  <p className="text-pretty leading-relaxed text-muted-foreground">{job.description}</p>
                </div>

                <Separator />

                {/* Skills Required */}
                <div>
                  <h3 className="mb-3 font-semibold">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About the Client */}
            <Card>
              <CardHeader>
                <CardTitle>About the Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={job.postedBy.avatar || "/placeholder.svg"} alt={job.postedBy.name} />
                    <AvatarFallback>{job.postedBy.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{job.postedBy.name}</h4>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-foreground">{job.postedBy.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.postedBy.jobsPosted} jobs posted</span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Experienced client with a track record of successful projects. Clear communication and timely
                      payments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {isFreelancer ? (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this job</CardTitle>
                  <CardDescription>
                    {hasApplied ? "You have already applied to this job" : "Submit your proposal to the client"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasApplied ? (
                    <>
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Application Submitted</AlertTitle>
                        <AlertDescription className="text-sm">
                          Your proposal has been sent to the client. You can view your application status in the
                          dashboard.
                        </AlertDescription>
                      </Alert>
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href="/dashboard">View Dashboard</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="w-full" size="lg" onClick={() => setIsApplicationModalOpen(true)}>
                        Submit Proposal
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        You&apos;ll be able to review your proposal before submitting
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : isClient ? (
              <Card>
                <CardHeader>
                  <CardTitle>Client View</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Cannot Apply</AlertTitle>
                    <AlertDescription className="text-sm">
                      You&apos;re viewing this as a client. To apply for jobs, you need a freelancer account.
                    </AlertDescription>
                  </Alert>
                  <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
                    <Link href="/select-role">Switch to Freelancer</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Job Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Proposals</span>
                  <span className="font-medium">{job.applicants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span className="font-medium">{new Date(job.postedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Budget Type</span>
                  <span className="font-medium capitalize">{job.budget.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="font-medium">
                    {job.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {allJobs
                  .filter((j) => j.id !== job.id)
                  .slice(0, 3)
                  .map((similarJob) => (
                    <Link
                      key={similarJob.id}
                      href={`/jobs/${similarJob.id}`}
                      className="block rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                    >
                      <h4 className="line-clamp-2 text-sm font-medium leading-tight">{similarJob.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {similarJob.budget.type === "fixed"
                          ? `$${similarJob.budget.min.toLocaleString()}-$${similarJob.budget.max.toLocaleString()}`
                          : `$${similarJob.budget.min}-$${similarJob.budget.max}/hr`}
                      </p>
                    </Link>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isFreelancer && !hasApplied && (
        <ApplicationModal job={job} isOpen={isApplicationModalOpen} onClose={() => setIsApplicationModalOpen(false)} />
      )}
    </div>
  )
}
