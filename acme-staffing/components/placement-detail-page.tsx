"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { SendDocsDialog } from "@/components/send-docs-dialog"
import { usePlacement } from "@/hooks/use-placement-demo-state"
import type { Placement } from "@/lib/mock-data"

export function PlacementDetailPage({
  initialPlacement,
}: {
  initialPlacement: Placement
}) {
  const { placement } = usePlacement(initialPlacement.id, initialPlacement)

  if (!placement) {
    return null
  }

  const isReadyToStart = placement.status === "ready_to_start"

  return (
    <PageShell>
      <div className="pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to placements
        </Link>
      </div>

      <section className="border-b border-border/70 pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className={[
                  "size-2 rounded-full",
                  isReadyToStart ? "bg-primary" : "bg-muted-foreground/45",
                ].join(" ")}
              />
              {isReadyToStart ? "Ready to start" : "Documents pending"}
            </div>
            <div className="space-y-2">
              <h1 className="max-w-[18ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {placement.candidateName}
              </h1>
              <p className="max-w-[56ch] text-base text-muted-foreground text-pretty">
                {placement.role} placement for {placement.clientCompany} with a{" "}
                <span className="tabular-nums">${placement.hourlyRate}/hr</span>{" "}
                start date of {placement.startDate}.
              </p>
            </div>
          </div>

          {!isReadyToStart && (
            <div className="w-full max-w-sm rounded-3xl border border-border/70 bg-card p-6">
              <p className="text-sm font-medium text-foreground">Next step</p>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                Send the contractor agreement and background consent to move
                this placement into a ready-to-start state.
              </p>
              <div className="mt-5">
                <SendDocsDialog placement={placement} />
              </div>
            </div>
          )}

          {isReadyToStart && (
            <div className="w-full max-w-sm rounded-3xl border border-border/70 bg-card p-6">
              <p className="text-sm font-medium text-foreground">
                Placement complete
              </p>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                Both onboarding documents are finished and the candidate is
                cleared for the scheduled start date.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="pt-8">
        <div className="flex flex-col gap-2 pb-6">
          <h2 className="text-lg font-semibold">Placement summary</h2>
          <p className="max-w-[52ch] text-sm text-muted-foreground text-pretty">
            The operational details below stay visible while you manage
            onboarding, so recruiters can review the essentials at a glance.
          </p>
        </div>

        <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          <div className="border-t border-border/70 pt-4">
            <dt className="text-sm font-medium text-foreground">Candidate</dt>
            <dd className="mt-1 text-base text-muted-foreground">
              {placement.candidateName}
            </dd>
          </div>
          <div className="border-t border-border/70 pt-4">
            <dt className="text-sm font-medium text-foreground">Client</dt>
            <dd className="mt-1 text-base text-muted-foreground">
              {placement.clientCompany}
            </dd>
          </div>
          <div className="border-t border-border/70 pt-4">
            <dt className="text-sm font-medium text-foreground">Role</dt>
            <dd className="mt-1 text-base text-muted-foreground">
              {placement.role}
            </dd>
          </div>
          <div className="border-t border-border/70 pt-4">
            <dt className="text-sm font-medium text-foreground">Hourly rate</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              ${placement.hourlyRate}/hr
            </dd>
          </div>
          <div className="border-t border-border/70 pt-4">
            <dt className="text-sm font-medium text-foreground">Start date</dt>
            <dd className="mt-1 text-base text-muted-foreground tabular-nums">
              {placement.startDate}
            </dd>
          </div>
          <div className="border-t border-border/70 pt-4">
            <dt className="text-sm font-medium text-foreground">
              Document package
            </dt>
            <dd className="mt-1 text-base text-muted-foreground">
              Contractor agreement and background check consent
            </dd>
          </div>
          <div className="border-t border-border/70 pt-4">
            <dt className="text-sm font-medium text-foreground">Placement ID</dt>
            <dd className="mt-1 text-base text-muted-foreground tabular-nums">
              #{placement.id}
            </dd>
          </div>
        </dl>
      </section>
    </PageShell>
  )
}
