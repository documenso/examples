"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useProjectsState } from "@/hooks/use-project-state"
import { cn } from "@/lib/utils"

const toneClasses = {
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

export default function ProjectDocumentsPage() {
  const params = useParams<{ id: string }>()
  const { getProject } = useProjectsState()
  const project = getProject(params.id)

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href={`/projects/${project.id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Back to project
      </Link>

      <header className="mt-6 border-b border-zinc-950/10 pb-8 dark:border-white/10">
        <p className="text-sm text-muted-foreground">{project.name}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
          Documents
        </h1>
        <p className="mt-4 max-w-[56ch] text-base text-pretty text-muted-foreground">
          Review the full document trail for this project, including statements
          of work, invoices, and signed change orders.
        </p>
      </header>

      <div className="-mx-6 -my-2 mt-6 overflow-x-auto whitespace-nowrap">
        <div className="inline-block min-w-full px-6 py-2 align-middle">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-950/10 text-muted-foreground dark:border-white/10">
              <tr>
                <th className="py-3 pr-6 text-left font-medium whitespace-nowrap">
                  Document
                </th>
                <th className="py-3 pr-6 text-left font-medium whitespace-nowrap">
                  Type
                </th>
                <th className="py-3 pr-6 text-left font-medium whitespace-nowrap">
                  Date
                </th>
                <th className="py-3 text-left font-medium whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-950/10 dark:divide-white/10">
              {project.documentHistory.map((document, index) => (
                <tr
                  key={
                    document.envelopeId ??
                    document.documentId ??
                    `${document.name}-${index}`
                  }
                >
                  <td className="py-4 pr-6 font-medium">{document.name}</td>
                  <td className="py-4 pr-6 text-muted-foreground">
                    {document.type}
                  </td>
                  <td className="py-4 pr-6 text-muted-foreground">
                    {new Date(document.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 text-muted-foreground">
                    <StatusText
                      label={document.status}
                      tone={document.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
