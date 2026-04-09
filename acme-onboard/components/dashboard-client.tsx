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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UserPlus, Users } from "lucide-react"
import { StartOnboardingDialog } from "@/components/start-onboarding-dialog"

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

  return (
    <div className="mx-auto min-h-svh max-w-5xl p-6 md:p-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            HR Onboarding
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage new hire document signing
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            New Hires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hires.map((hire) => (
                <TableRow key={hire.name}>
                  <TableCell className="font-medium">{hire.name}</TableCell>
                  <TableCell>{hire.role}</TableCell>
                  <TableCell>{hire.startDate}</TableCell>
                  <TableCell>{hire.salary}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(hire.signedCount / 3) * 100}
                        className="h-2 w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        {hire.signedCount}/3 signed
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {hire.sessionId === null ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(hire)
                          setDialogOpen(true)
                        }}
                      >
                        Start Onboarding
                      </Button>
                    ) : hire.signedCount < 3 ? (
                      <Link
                        href={`/onboarding/${hire.sessionId}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Continue
                      </Link>
                    ) : (
                      <Badge variant="default">Complete</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StartOnboardingDialog
        employee={selectedEmployee}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedEmployee(null)
        }}
      />
    </div>
  )
}
