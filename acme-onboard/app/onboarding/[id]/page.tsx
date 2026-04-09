import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus } from "lucide-react"
import { SigningChecklist } from "@/components/signing-checklist"

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await db.onboardingSession.findUnique({
    where: { id },
  })

  if (!session) {
    notFound()
  }

  const sessionData = {
    id: session.id,
    employeeName: session.employeeName,
    email: session.email,
    role: session.role,
    startDate: session.startDate,
    salary: session.salary,
    offerToken: session.offerToken,
    offerSigned: session.offerSigned,
    ndaToken: session.ndaToken,
    ndaSigned: session.ndaSigned,
    handbookToken: session.handbookToken,
    handbookSigned: session.handbookSigned,
  }

  return (
    <div className="mx-auto min-h-svh max-w-3xl p-6 md:p-10">

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Onboarding: {session.employeeName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {session.role} &middot; Starting {session.startDate}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div className="min-w-0">
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium truncate">{session.employeeName}</p>
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium truncate">{session.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="font-medium">{session.role}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Salary</p>
              <p className="font-medium">{session.salary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SigningChecklist initialSession={sessionData} />
    </div>
  )
}
