import Link from "next/link"
import {
  Stamp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { sessions, type SessionStatus } from "@/lib/mock-data"

const statusConfig: Record<
  SessionStatus,
  { label: string; variant: "destructive" | "default" | "secondary"; icon: typeof AlertCircle }
> = {
  unprepared: { label: "Unprepared", variant: "destructive", icon: AlertCircle },
  prepared: { label: "Prepared", variant: "default", icon: CheckCircle2 },
  completed: { label: "Completed", variant: "secondary", icon: CheckCircle2 },
}

export default function DashboardPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stamp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Acme Notary</h1>
            <p className="text-xs text-muted-foreground">
              Remote Online Notarization
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Upcoming Sessions
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your notarization sessions — prepare documents and start
            signing.
          </p>
        </div>

        <div className="grid gap-4">
          {sessions.map((session) => {
            const config = statusConfig[session.status]
            const StatusIcon = config.icon
            return (
              <Card key={session.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {session.clientName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      {session.documentType}
                    </CardDescription>
                  </div>
                  <Badge variant={config.variant} className="flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {session.scheduledTime}
                  </div>
                  <div className="flex gap-2">
                    {session.status === "unprepared" && (
                      <Link href={`/sessions/${session.id}/prepare`} className={buttonVariants({ size: "sm" })}>
                          <FileText className="mr-1.5 h-3.5 w-3.5" />
                          Prepare
                      </Link>
                    )}
                    {session.status === "prepared" && (
                      <Link href={`/sessions/${session.id}/sign`} className={buttonVariants({ size: "sm" })}>
                          <Video className="mr-1.5 h-3.5 w-3.5" />
                          Start Session
                      </Link>
                    )}
                    {session.status === "completed" && (
                      <Button variant="outline" size="sm" disabled>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
