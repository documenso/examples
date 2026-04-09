"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { useCertifications } from "@/hooks/use-certifications"
import { mergeModuleWithCertification } from "@/lib/certification-store"
import { modules, type TrainingModule } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function DashboardMetric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="bg-card px-5 py-5">
      <p className="truncate text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

function ModuleLibraryCard({ module }: { module: TrainingModule }) {
  const isCertified = module.status === "certified"

  return (
    <article className="course-panel flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-xs font-medium",
                isCertified
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-border bg-muted text-foreground"
              )}
            >
              {isCertified ? "Certified" : "Assigned"}
            </span>
            <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {module.oshaRef}
            </span>
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            {module.title}
          </h3>
        </div>

        <p className="shrink-0 text-sm text-muted-foreground">
          {module.duration}
        </p>
      </div>

      <p className="mt-4 text-sm/6 text-muted-foreground">
        {module.description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          {isCertified
            ? "Signed record available"
            : "Review and sign to complete"}
        </p>

        <Link
          href={`/modules/${module.id}`}
          className={cn(
            buttonVariants({
              variant: isCertified ? "outline" : "default",
              size: "sm",
            }),
            "px-3"
          )}
        >
          {isCertified ? "View record" : "Open module"}
        </Link>
      </div>
    </article>
  )
}

export function DashboardContent() {
  const certifications = useCertifications()
  const visibleModules = modules.map((module) =>
    mergeModuleWithCertification(module, certifications[module.id])
  )
  const requiredModules = visibleModules.filter(
    (module) => module.status !== "certified"
  )
  const completedModules = visibleModules.filter(
    (module) => module.status === "certified"
  )
  const completionRate = Math.round(
    (completedModules.length / visibleModules.length) * 100
  )
  const featuredModule = requiredModules[0] ?? visibleModules[0]

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader aside={<span>{visibleModules.length} assigned</span>} />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <p className="section-label">Safety training</p>
            <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              Assigned modules
            </h1>
            <p className="section-copy">
              Complete required training and review signed records in one place.
            </p>
          </div>

          {featuredModule ? (
            <Link
              href={`/modules/${featuredModule.id}`}
              className={cn(buttonVariants({ size: "sm" }), "px-3")}
            >
              {featuredModule.status === "certified"
                ? "Review latest record"
                : "Resume current module"}
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </section>

        <section className="mt-8 grid divide-y divide-border overflow-hidden rounded-lg border border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <DashboardMetric
            label="Required now"
            value={requiredModules.length.toString()}
            detail="Courses waiting for review and sign-off"
          />
          <DashboardMetric
            label="Certified"
            value={completedModules.length.toString()}
            detail="Signed records already stored"
          />
          <DashboardMetric
            label="Completion"
            value={`${completionRate}%`}
            detail="Current progress across assigned learning"
          />
        </section>

        <section className="mt-12 space-y-4" id="courses">
          <div className="space-y-3">
            <p className="section-label">Modules</p>
            <h2 className="section-title">Required courses for this crew.</h2>
            <p className="section-copy">
              Open any module to review the training, confirm the checklist, and
              sign the completion record.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {visibleModules.map((module) => (
              <ModuleLibraryCard key={module.id} module={module} />
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4" id="certifications">
          <div className="space-y-3">
            <p className="section-label">Certifications</p>
            <h2 className="section-title">Completed records.</h2>
          </div>

          {completedModules.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {completedModules.map((module) => (
                <article
                  key={module.id}
                  className="panel flex flex-col gap-5 p-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900">
                      Certified
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {module.oshaRef}
                    </span>
                  </div>

                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {module.title}
                  </h3>

                  <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>
                      Completed
                      <span className="mt-1 block text-foreground">
                        {module.certifiedDate ?? "On file"}
                      </span>
                    </p>
                    <p>
                      Expires
                      <span className="mt-1 block text-foreground">
                        {module.expiryDate ?? "On file"}
                      </span>
                    </p>
                  </div>

                  <Link
                    href={`/modules/${module.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-fit px-3"
                    )}
                  >
                    View record
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="panel p-6">
              <p className="text-sm text-muted-foreground">
                No signed records yet.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
