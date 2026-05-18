"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock3, FileText } from "lucide-react"
import { sessions, type SessionStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  getAllStoredSessionStates,
  getServerSessionStates,
  subscribeToSessionState,
} from "@/lib/session-state"

const statusConfig: Record<
  SessionStatus,
  { label: string; dotClassName: string; actionLabel: string; href?: (id: string) => string }
> = {
  unprepared: {
    label: "Unprepared",
    dotClassName: "bg-amber-500",
    actionLabel: "Prepare",
    href: (id) => `/sessions/${id}/prepare`,
  },
  prepared: {
    label: "Prepared",
    dotClassName: "bg-emerald-500",
    actionLabel: "Start",
    href: (id) => `/sessions/${id}/sign`,
  },
  completed: {
    label: "Completed",
    dotClassName: "bg-zinc-400",
    actionLabel: "Completed",
  },
}

export default function DashboardPage() {
  const storedSessionStates =
    useSyncExternalStore<ReturnType<typeof getAllStoredSessionStates>>(
      subscribeToSessionState,
      getAllStoredSessionStates,
      getServerSessionStates
    )
  const sessionList = sessions.map((session) => ({
    ...session,
    status: storedSessionStates[session.id]?.status ?? session.status,
  }))

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 py-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Acme Notary</p>
            <p className="text-base/6 text-muted-foreground sm:text-sm/6">
              Remote online notarization.
            </p>
          </div>
          <p className="text-right text-base/6 text-muted-foreground sm:text-sm/6">
            Four active client sessions.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-2">
          <h1 className="max-w-[20ch] text-3xl font-semibold tracking-tight text-balance text-foreground">
            Sessions
          </h1>
          <p className="max-w-[56ch] text-base/7 text-pretty text-muted-foreground sm:text-sm/6">
            Prepare documents and conduct remote notarizations with a simpler,
            clearer workflow.
          </p>
        </div>

        <div className="-mx-6 -my-2 mt-8 overflow-x-auto whitespace-nowrap">
          <div className="inline-block min-w-full px-6 py-2 align-middle">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-6 text-sm font-medium whitespace-nowrap text-muted-foreground">
                    Client
                  </th>
                  <th className="px-6 py-3 text-sm font-medium whitespace-nowrap text-muted-foreground">
                    Document
                  </th>
                  <th className="px-6 py-3 text-sm font-medium whitespace-nowrap text-muted-foreground">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-sm font-medium whitespace-nowrap text-muted-foreground">
                    Status
                  </th>
                  <th className="py-3 pl-6 text-right text-sm font-medium whitespace-nowrap text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sessionList.map((session) => {
                  const config = statusConfig[session.status]

                  return (
                    <tr key={session.id}>
                      <td className="py-4 pr-6 align-top">
                        <div className="space-y-1">
                          <p className="text-base/6 font-medium text-foreground sm:text-sm/6">
                            {session.clientName}
                          </p>
                          <p className="text-base/6 text-muted-foreground sm:text-sm/6">
                            {session.clientEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 text-base/6 text-foreground sm:text-sm/6">
                          <FileText className="size-4 h-lh shrink-0 stroke-muted-foreground" />
                          <span className="whitespace-nowrap">{session.documentType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 text-base/6 text-muted-foreground sm:text-sm/6">
                          <Clock3 className="size-4 h-lh shrink-0 stroke-muted-foreground" />
                          <span className="tabular-nums whitespace-nowrap">{session.scheduledTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 text-base/6 text-foreground sm:text-sm/6">
                          <span
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              config.dotClassName
                            )}
                            aria-hidden="true"
                          />
                          <span>{config.label}</span>
                        </div>
                      </td>
                      <td className="py-4 pl-6 text-right align-top">
                        {config.href ? (
                          <Link
                            href={config.href(session.id)}
                            className="inline-flex items-center gap-1 text-base/6 font-medium text-foreground hover:underline sm:text-sm/6"
                          >
                            {config.actionLabel}
                            <ArrowRight className="size-4 shrink-0" />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-base/6 text-muted-foreground sm:text-sm/6">
                            <CheckCircle2 className="size-4 shrink-0 stroke-muted-foreground" />
                            {config.actionLabel}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
