import { notFound } from "next/navigation"
import { db } from "@/lib/db"
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

  const signedCount =
    (session.offerSigned ? 1 : 0) +
    (session.ndaSigned ? 1 : 0) +
    (session.handbookSigned ? 1 : 0)

  return (
    <main className="isolate min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex flex-col gap-4 border-b border-border/60 pb-8">
          <div className="flex items-center gap-2 text-base/7 text-muted-foreground sm:text-sm/6">
            <UserPlus className="size-4 shrink-0 stroke-muted-foreground" />
            <span>Employee session</span>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="max-w-[24ch] text-4xl font-semibold tracking-tight text-balance sm:text-3xl">
                Onboarding for {session.employeeName}
              </h1>
              <p className="max-w-[48ch] text-base/7 text-pretty text-muted-foreground sm:text-sm/6">
                {session.role} starting {session.startDate}. Review the employee
                details below, then complete each required document in order.
              </p>
            </div>

            <dl className="flex items-end gap-4 border-t border-border/60 pt-4 text-base/7 tabular-nums sm:text-sm/6 lg:border-t-0 lg:pt-0">
              <div className="flex flex-col gap-1">
                <dt className="font-medium text-foreground">Progress</dt>
                <dd className="text-3xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {signedCount}/3
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="max-w-[35ch] text-2xl font-semibold tracking-tight text-balance sm:text-xl">
              Employee details
            </h2>
            <p className="max-w-[56ch] text-base/7 text-pretty text-muted-foreground sm:text-sm/6">
              Keep the signer details visible while completing the document set.
            </p>
          </div>

          <dl className="grid gap-4 border-t border-border/60 pt-4 text-base/7 sm:grid-cols-2 sm:gap-0 sm:text-sm/6 lg:grid-cols-4">
            <div className="flex flex-col gap-1 sm:pr-4 lg:pr-6">
              <dt className="font-medium text-foreground">Name</dt>
              <dd className="truncate text-muted-foreground">
                {session.employeeName}
              </dd>
            </div>
            <div className="flex flex-col gap-1 border-t border-border/60 pt-4 sm:border-t-0 sm:border-l sm:px-4 sm:pt-0 lg:px-6">
              <dt className="font-medium text-foreground">Email</dt>
              <dd className="truncate text-muted-foreground">{session.email}</dd>
            </div>
            <div className="flex flex-col gap-1 border-t border-border/60 pt-4 sm:pt-0 lg:border-l lg:px-6 lg:pt-0">
              <dt className="font-medium text-foreground">Role</dt>
              <dd className="text-muted-foreground">{session.role}</dd>
            </div>
            <div className="flex flex-col gap-1 border-t border-border/60 pt-4 sm:border-l sm:px-4 sm:pt-0 lg:px-6">
              <dt className="font-medium text-foreground">Salary</dt>
              <dd className="tabular-nums text-muted-foreground">
                {session.salary}
              </dd>
            </div>
          </dl>
        </section>

        <SigningChecklist initialSession={sessionData} />
      </div>
    </main>
  )
}
