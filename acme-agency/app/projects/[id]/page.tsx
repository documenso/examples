"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { formatCurrency } from "@/lib/mock-data"
import { ScopeChangeActions } from "@/components/scope-change-actions"
import { useProjectsState } from "@/hooks/use-project-state"
import { cn } from "@/lib/utils"

const toneClasses = {
  Pending: "bg-amber-500",
  Active: "bg-emerald-500",
  Completed: "bg-zinc-400",
  Draft: "bg-zinc-400",
  Sent: "bg-amber-500",
  Signed: "bg-emerald-500",
  Expired: "bg-rose-500",
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

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const { getProject, markChangeOrderSent } = useProjectsState()
  const project = getProject(params.id)

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  const isDraft = project.sowStatus === "Draft"
  const isActive = project.status === "Active"
  const isSent = project.sowStatus === "Sent"

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        All projects
      </Link>

      <header className="mt-6 max-w-[56ch] space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {project.name}
          </h1>
          <p className="text-base text-pretty text-muted-foreground">
            {isDraft
              ? `Finalize the statement of work and send it to ${project.client} for signature.`
              : isSent
                ? `The statement of work has been sent to ${project.client} and is waiting for signature.`
                : `Signed statement of work for ${project.client}. Review deliverables, scope changes, and document history below.`}
          </p>
        </div>

        <dl className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="font-medium text-foreground">Client</dt>
            <dd className="mt-1 text-muted-foreground">{project.client}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Timeline</dt>
            <dd className="mt-1 text-muted-foreground">
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
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Budget</dt>
            <dd className="mt-1 text-foreground tabular-nums">
              {formatCurrency(project.budget)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Status</dt>
            <dd className="mt-1 text-muted-foreground">
              <StatusText label={project.status} tone={project.status} />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Agreement</dt>
            <dd className="mt-1 text-muted-foreground">
              <StatusText label={project.sowStatus} tone={project.sowStatus} />
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-3">
          {isDraft && (
            <Link
              href={`/projects/${project.id}/draft`}
              className={buttonVariants({ className: "rounded-lg" })}
            >
              Draft statement of work
            </Link>
          )}
          <Link
            href={`/projects/${project.id}/documents`}
            className={buttonVariants({
              className: "rounded-lg",
              variant: "outline",
            })}
          >
            View documents
          </Link>
        </div>
      </header>

      <section className="mt-12">
        <div className="max-w-[48ch]">
          <h2 className="text-lg font-semibold tracking-tight">Deliverables</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Included work agreed for this engagement.
          </p>
        </div>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-foreground marker:text-muted-foreground">
          {project.deliverables.map((deliverable) => (
            <li key={deliverable}>{deliverable}</li>
          ))}
        </ul>
      </section>

      {isActive && project.scopeChanges.length > 0 && (
        <section className="mt-12">
          <div className="max-w-[48ch]">
            <h2 className="text-lg font-semibold tracking-tight">
              Scope changes
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pending additions that need a signed change order before they are
              added to the budget.
            </p>
          </div>

          <ul role="list" className="mt-6 space-y-5">
            {project.scopeChanges.map((scopeChange) => (
              <li
                key={scopeChange.id}
                className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {scopeChange.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="tabular-nums">
                      {formatCurrency(scopeChange.amount)}
                    </span>{" "}
                    additional budget
                  </p>
                </div>

                <ScopeChangeActions
                  projectId={project.id}
                  projectName={project.name}
                  clientName={project.client}
                  clientEmail={project.clientEmail}
                  changeDescription={scopeChange.description}
                  budgetImpact={scopeChange.amount}
                  currentBudget={project.budget}
                  scopeChangeId={scopeChange.id}
                  onDocumentCreated={(documentId) => {
                    markChangeOrderSent(project.id, {
                      documentId,
                      scopeChangeId: scopeChange.id,
                      description: scopeChange.description,
                    })
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <div className="max-w-[48ch]">
          <h2 className="text-lg font-semibold tracking-tight">
            Document history
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A complete record of every statement of work, invoice, and change
            order for this project.
          </p>
        </div>

        <ul role="list" className="mt-6 space-y-4 text-sm">
          {project.documentHistory.map((document, index) => (
            <li
              key={document.envelopeId ?? document.documentId ?? `${document.name}-${index}`}
              className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-6"
            >
              <div className="space-y-1">
                <p className="font-medium text-foreground">{document.name}</p>
                <p className="text-muted-foreground">
                  {document.type} ·{" "}
                  {new Date(document.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <p className="text-muted-foreground">
                <StatusText label={document.status} tone={document.status} />
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
