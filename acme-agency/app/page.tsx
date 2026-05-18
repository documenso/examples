"use client"

import Link from "next/link"
import { formatCurrency } from "@/lib/mock-data"
import { useProjectsState } from "@/hooks/use-project-state"
import { cn } from "@/lib/utils"

const toneClasses = {
  Pending: "bg-amber-500",
  Active: "bg-emerald-500",
  Completed: "bg-zinc-400",
  Draft: "bg-zinc-400",
  Sent: "bg-amber-500",
  Signed: "bg-emerald-500",
} as const

function StatusText({
  label,
  tone,
}: {
  label: string
  tone: keyof typeof toneClasses
}) {
  return (
    <span className="inline-flex items-center gap-2 text-foreground">
      <span className={cn("size-1.5 rounded-full", toneClasses[tone])} />
      <span>{label}</span>
    </span>
  )
}

export default function DashboardPage() {
  const { projects } = useProjectsState()

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="max-w-[56ch]">
        <p className="text-sm text-muted-foreground">Acme Agency</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
          Client projects
        </h1>
        <p className="mt-4 text-base text-pretty text-muted-foreground">
          Track statements of work, change orders, and signatures across active
          client engagements.
        </p>
      </header>

      <section className="mt-10">
        <div className="border-b border-zinc-950/10 pb-3 dark:border-white/10">
          <h2 className="text-sm font-medium">Open work</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} projects in this demo workspace.
          </p>
        </div>

        <div className="-mx-6 -my-2 mt-4 overflow-x-auto whitespace-nowrap">
          <div className="inline-block min-w-full px-6 py-2 align-middle">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-950/10 text-muted-foreground dark:border-white/10">
                <tr>
                  <th className="py-3 pr-6 text-left font-medium whitespace-nowrap">
                    Project
                  </th>
                  <th className="py-3 pr-6 text-left font-medium whitespace-nowrap">
                    Schedule
                  </th>
                  <th className="py-3 pr-6 text-left font-medium whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3 pr-6 text-left font-medium whitespace-nowrap">
                    Agreement
                  </th>
                  <th className="py-3 text-right font-medium whitespace-nowrap">
                    Budget
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-950/10 dark:divide-white/10">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/20">
                    <td className="py-4 pr-6 align-top">
                      <Link href={`/projects/${project.id}`} className="block">
                        <span className="block font-medium text-foreground">
                          {project.name}
                        </span>
                        <span className="mt-1 block text-muted-foreground">
                          {project.client}
                        </span>
                      </Link>
                    </td>
                    <td className="py-4 pr-6 align-top text-muted-foreground">
                      {new Date(project.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      –{" "}
                      {new Date(project.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 pr-6 align-top text-muted-foreground">
                      <StatusText
                        label={project.status}
                        tone={project.status}
                      />
                    </td>
                    <td className="py-4 pr-6 align-top text-muted-foreground">
                      <StatusText
                        label={project.sowStatus}
                        tone={project.sowStatus}
                      />
                    </td>
                    <td className="py-4 text-right align-top font-medium text-foreground tabular-nums">
                      {formatCurrency(project.budget)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
