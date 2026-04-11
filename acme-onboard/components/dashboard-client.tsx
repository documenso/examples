"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Users } from "lucide-react"
import { StartOnboardingDialog } from "@/components/start-onboarding-dialog"
import { cn } from "@/lib/utils"

export interface HireWithProgress {
  name: string
  role: string
  startDate: string
  salary: string
  signedCount: number
  sessionId: string | null
}

export function DashboardClient({ hires }: { hires: HireWithProgress[] }) {
  const [selectedEmployee, setSelectedEmployee] =
    useState<HireWithProgress | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const totalHires = hires.length
  const completedHires = hires.filter((hire) => hire.signedCount === 3).length
  const inProgressHires = hires.filter(
    (hire) => hire.sessionId !== null && hire.signedCount < 3,
  ).length

  return (
    <main className="isolate min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex flex-col gap-6 border-b border-border/60 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-3">
            <div className="flex items-center gap-2 text-base/7 text-muted-foreground sm:text-sm/6">
              <Users className="size-4 shrink-0 stroke-muted-foreground" />
              <span>Acme HR</span>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="max-w-[24ch] text-4xl font-semibold tracking-tight text-balance sm:text-3xl">
                Employee onboarding
              </h1>
              <p className="max-w-[56ch] text-base/7 text-pretty text-muted-foreground sm:text-sm/6">
                Track each new hire through offer signing, policy review, and
                handbook acknowledgment without changing the underlying flow.
              </p>
            </div>
          </div>

          <dl className="grid gap-4 border-t border-border/60 pt-4 text-base/7 tabular-nums sm:grid-cols-3 sm:gap-0 sm:border-t-0 sm:pt-0 sm:text-sm/6 lg:min-w-[24rem]">
            <div className="flex flex-col gap-1 sm:pr-4">
              <dt className="font-medium text-foreground">New hires</dt>
              <dd className="text-3xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {totalHires}
              </dd>
            </div>
            <div className="flex flex-col gap-1 border-t border-border/60 pt-4 sm:border-t-0 sm:border-l sm:px-4 sm:pt-0">
              <dt className="font-medium text-foreground">In progress</dt>
              <dd className="text-3xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {inProgressHires}
              </dd>
            </div>
            <div className="flex flex-col gap-1 border-t border-border/60 pt-4 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
              <dt className="font-medium text-foreground">Complete</dt>
              <dd className="text-3xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {completedHires}
              </dd>
            </div>
          </dl>
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="max-w-[35ch] text-2xl font-semibold tracking-tight text-balance sm:text-xl">
              Active onboarding queue
            </h2>
            <p className="max-w-[56ch] text-base/7 text-pretty text-muted-foreground sm:text-sm/6">
              Start a new session or resume an in-progress document pack for any
              pending hire.
            </p>
          </div>

          <div className="-mx-5 -my-2 overflow-x-auto whitespace-nowrap sm:-mx-8">
            <div className="inline-block min-w-full px-5 py-2 align-middle sm:px-8">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-border/60">
                    <TableHead className="whitespace-nowrap">Name</TableHead>
                    <TableHead className="whitespace-nowrap">Role</TableHead>
                    <TableHead className="whitespace-nowrap">Start date</TableHead>
                    <TableHead className="whitespace-nowrap">Salary</TableHead>
                    <TableHead className="whitespace-nowrap">Progress</TableHead>
                    <TableHead className="whitespace-nowrap text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hires.map((hire) => (
                    <TableRow key={hire.name} className="border-border/60">
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">
                            {hire.name}
                          </span>
                          <span className="text-base/7 text-muted-foreground sm:text-sm/6">
                            {hire.sessionId === null
                              ? "Not started"
                              : hire.signedCount === 3
                                ? "Ready for first day"
                                : "Awaiting signatures"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-base/7 text-muted-foreground sm:text-sm/6">
                        {hire.role}
                      </TableCell>
                      <TableCell className="text-base/7 text-muted-foreground sm:text-sm/6">
                        {hire.startDate}
                      </TableCell>
                      <TableCell className="tabular-nums text-base/7 text-foreground sm:text-sm/6">
                        {hire.salary}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-44 items-center gap-3">
                          <Progress
                            value={(hire.signedCount / 3) * 100}
                            className="h-2 flex-1"
                          />
                          <span className="tabular-nums text-base/7 text-muted-foreground sm:text-sm/6">
                            {hire.signedCount}/3
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {hire.sessionId === null ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEmployee(hire)
                              setDialogOpen(true)
                            }}
                          >
                            Start onboarding
                          </Button>
                        ) : hire.signedCount < 3 ? (
                          <Link
                            href={`/onboarding/${hire.sessionId}`}
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "sm",
                              }),
                            )}
                          >
                            Continue
                            <ArrowRight className="size-4 shrink-0" />
                          </Link>
                        ) : (
                          <Badge className="tabular-nums" variant="secondary">
                            Complete
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </div>

      <StartOnboardingDialog
        employee={selectedEmployee}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedEmployee(null)
        }}
      />
    </main>
  )
}
