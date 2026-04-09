"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button-variants"
import { PageShell } from "@/components/page-shell"
import { usePlacements } from "@/hooks/use-placement-demo-state"

function formatStatus(status: "pending" | "ready_to_start") {
  return status === "ready_to_start" ? "Ready to start" : "Docs pending"
}

export default function DashboardPage() {
  const { placements } = usePlacements()
  const totalPlacements = placements.length
  const pendingDocs = placements.filter((p) => p.status === "pending").length
  const readyToStart = placements.filter(
    (p) => p.status === "ready_to_start"
  ).length
  const stats = [
    { label: "Total placements", value: totalPlacements },
    { label: "Documents pending", value: pendingDocs },
    { label: "Ready to start", value: readyToStart },
  ]

  return (
    <PageShell>
      <header className="flex flex-col gap-8 pb-8">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            aria-label="Homepage"
            className="w-fit text-sm font-medium text-muted-foreground"
          >
            Acme Staffing
          </Link>
          <div className="space-y-3">
            <h1 className="max-w-[16ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Placements
            </h1>
            <p className="max-w-[58ch] text-base text-pretty text-muted-foreground">
              Track new contractor placements, keep onboarding on schedule, and
              move signed candidates into a ready-to-start state without leaving
              the workspace.
            </p>
          </div>
        </div>

        <div className="grid border-y border-border/70 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={[
                "py-4",
                index > 0 ? "border-t border-border/70 sm:border-t-0" : "",
                index > 0 ? "sm:border-l sm:border-border/70 sm:pl-6" : "",
                index === 0 ? "sm:pr-6" : "",
              ].join(" ")}
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </header>

      <section className="pt-8">
        <div className="flex flex-col gap-2 pb-5">
          <h2 className="text-lg font-semibold">Placement roster</h2>
          <p className="max-w-[54ch] text-base text-pretty text-muted-foreground sm:text-sm">
            Review each placement, confirm document status, and open the
            onboarding flow for candidates that still need signatures.
          </p>
        </div>

        <div className="divide-y divide-border/70 md:hidden">
          {placements.map((placement) => (
            <article key={placement.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-base font-medium text-foreground sm:text-sm">
                    {placement.candidateName}
                  </p>
                  <p className="text-base text-muted-foreground sm:text-sm">
                    Placement #{placement.id}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-base text-muted-foreground sm:text-sm">
                  <span
                    className={[
                      "size-2 rounded-full",
                      placement.status === "ready_to_start"
                        ? "bg-primary"
                        : "bg-muted-foreground/45",
                    ].join(" ")}
                  />
                  {formatStatus(placement.status)}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <dt className="text-base font-medium text-foreground sm:text-sm">
                    Company
                  </dt>
                  <dd className="mt-1 text-base text-muted-foreground sm:text-sm">
                    {placement.clientCompany}
                  </dd>
                </div>
                <div>
                  <dt className="text-base font-medium text-foreground sm:text-sm">
                    Role
                  </dt>
                  <dd className="mt-1 text-base text-muted-foreground sm:text-sm">
                    {placement.role}
                  </dd>
                </div>
                <div>
                  <dt className="text-base font-medium text-foreground sm:text-sm">
                    Rate
                  </dt>
                  <dd className="mt-1 text-base text-foreground tabular-nums sm:text-sm">
                    ${placement.hourlyRate}/hr
                  </dd>
                </div>
                <div>
                  <dt className="text-base font-medium text-foreground sm:text-sm">
                    Start date
                  </dt>
                  <dd className="mt-1 text-base text-muted-foreground tabular-nums sm:text-sm">
                    {placement.startDate}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={`/placements/${placement.id}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  Review
                </Link>
                {placement.status === "pending" && (
                  <Link
                    href={`/placements/${placement.id}`}
                    className="text-base font-medium text-primary sm:text-sm"
                  >
                    Send docs
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="hidden md:block">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="border-b border-border/70">
                <th className="w-[18%] py-3 pr-4 text-sm font-medium whitespace-nowrap">
                  Candidate
                </th>
                <th className="w-[18%] px-4 py-3 text-sm font-medium whitespace-nowrap">
                  Company
                </th>
                <th className="w-[19%] px-4 py-3 text-sm font-medium whitespace-nowrap">
                  Role
                </th>
                <th className="w-[11%] px-4 py-3 text-sm font-medium whitespace-nowrap">
                  Rate
                </th>
                <th className="w-[14%] px-4 py-3 text-sm font-medium whitespace-nowrap">
                  Start date
                </th>
                <th className="w-[12%] px-4 py-3 text-sm font-medium whitespace-nowrap">
                  Status
                </th>
                <th className="w-[16%] py-3 pl-4 text-sm font-medium whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {placements.map((placement) => (
                <tr
                  key={placement.id}
                  className="border-b border-border/60 last:border-b-0"
                >
                  <td className="py-4 pr-4 align-top">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {placement.candidateName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Placement #{placement.id}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                    {placement.clientCompany}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                    {placement.role}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-foreground tabular-nums">
                    ${placement.hourlyRate}/hr
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-muted-foreground tabular-nums">
                    {placement.startDate}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className={[
                          "size-2 rounded-full",
                          placement.status === "ready_to_start"
                            ? "bg-primary"
                            : "bg-muted-foreground/45",
                        ].join(" ")}
                      />
                      {formatStatus(placement.status)}
                    </span>
                  </td>
                  <td className="py-4 pl-4 align-top">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/placements/${placement.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Review
                      </Link>
                      {placement.status === "pending" && (
                        <Link
                          href={`/placements/${placement.id}`}
                          className="text-sm font-medium text-primary"
                        >
                          Send docs
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  )
}
