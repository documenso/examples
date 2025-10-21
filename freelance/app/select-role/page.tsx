"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, UserCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { useState } from "react"

export default function SelectRolePage() {
  const router = useRouter()
  const { setUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelection = async (role: "client" | "freelancer") => {
    setIsLoading(true)
    try {
      // Fetch existing demo user for this role
      const response = await fetch(`/api/users?role=${role}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch user")
      }

      const user = await response.json()

      // Save user data to context
      setUser({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })

      router.push("/")
    } catch {
      alert(`Failed to log in as ${role}. Please make sure the database is seeded (run 'bun db:seed').`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Briefcase className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-balance text-3xl font-bold sm:text-4xl">Welcome to FreelanceHub</h1>
          <p className="mt-3 text-pretty text-lg text-muted-foreground">Choose your role to explore the demo</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This is a demo with pre-populated data. Switch between Client and Freelancer to see different features.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Client Card */}
          <Card
            className="group cursor-pointer transition-all hover:shadow-lg"
            onClick={() => handleRoleSelection("client")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Briefcase className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">I&apos;m a Client</CardTitle>
              <CardDescription className="text-base">Hiring for a project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-center">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Post jobs and projects</li>
                <li>✓ Review freelancer applications</li>
                <li>✓ Manage contracts and milestones</li>
                <li>✓ Make secure payments</li>
              </ul>
              <Button className="mt-4 w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Loading..." : "Continue as Client"}
              </Button>
            </CardContent>
          </Card>

          {/* Freelancer Card */}
          <Card
            className="group cursor-pointer transition-all hover:shadow-lg"
            onClick={() => handleRoleSelection("freelancer")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <UserCircle className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">I&apos;m a Freelancer</CardTitle>
              <CardDescription className="text-base">Looking for work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-center">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Browse available jobs</li>
                <li>✓ Submit proposals to clients</li>
                <li>✓ Sign contracts digitally</li>
                <li>✓ Track project milestones</li>
              </ul>
              <Button className="mt-4 w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Loading..." : "Continue as Freelancer"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can switch between roles anytime from the navigation menu
        </p>
      </div>
    </div>
  )
}
