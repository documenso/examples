"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, DollarSign, Users, Star } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useJobs } from "@/lib/queries"

export default function HomePage() {
  const { isClient } = useUser()
  const router = useRouter()
  const { data: jobs = [], isLoading: loading } = useJobs()

  useEffect(() => {
    if (isClient) {
      router.push("/dashboard")
    }
  }, [isClient, router])

  if (isClient) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find the perfect freelance
              <br />
              services for your business
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Connect with talented freelancers, post jobs, and manage contracts with embedded document signing powered
              by Documenso.
            </p>
          </div>
        </div>
      </section>      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Available Jobs</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? "Loading..." : `${jobs.length} jobs available`}
            </p>
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">No jobs available</div>
          ) : (
            jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="group h-full transition-all hover:shadow-lg">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="line-clamp-2 text-balance font-semibold leading-tight group-hover:text-primary">
                        {job.title}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {job.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={job.postedBy.avatar || "/placeholder.svg"} alt={job.postedBy.name} />
                      <AvatarFallback>{job.postedBy.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{job.postedBy.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{job.postedBy.rating}</span>
                        <span>·</span>
                        <span>{job.postedBy.jobsPosted} jobs</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="line-clamp-3 text-pretty text-sm text-muted-foreground">{job.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex-col items-start gap-3 border-t border-border pt-4">
                  <div className="flex w-full items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium text-foreground">
                        {job.budget.type === "fixed"
                          ? `$${job.budget.min.toLocaleString()} - $${job.budget.max.toLocaleString()}`
                          : `$${job.budget.min} - $${job.budget.max}/hr`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{job.duration}</span>
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{job.applicants} applicants</span>
                    </div>
                    <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
