"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { EmbedSignDocument } from "@documenso/embed-react"
import { useProjectsState } from "@/hooks/use-project-state"

export default function SignChangeOrderPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getProject, markChangeOrderSigned, markSowSigned } =
    useProjectsState()
  const signingToken = searchParams.get("token")
  const flow = searchParams.get("flow")
  const envelopeId = searchParams.get("envelopeId")
  const documentIdValue = searchParams.get("documentId")
  const documentId = documentIdValue ? Number(documentIdValue) : undefined
  const scopeChangeId = searchParams.get("scopeChangeId")
  const amountValue = searchParams.get("amount")
  const amount = amountValue ? Number(amountValue) : undefined
  const project = getProject(params.id)

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  if (!project) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  const heading =
    flow === "sow" ? "Sign Statement of Work" : "Sign Change Order"
  const description =
    flow === "sow"
      ? "Review and sign the SOW to activate the project."
      : "Review and sign the change order for this project."

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href={`/projects/${params.id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Back to project
      </Link>

      <header className="mt-6 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <p className="text-sm text-muted-foreground">{project.name}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
          {heading}
        </h1>
        <p className="mt-4 max-w-[56ch] text-base text-pretty text-muted-foreground">
          {description}
        </p>
      </header>

      {!signingToken ? (
        <div className="mt-6 flex min-h-[40rem] items-center justify-center rounded-xl border border-zinc-950/10 bg-muted/20 px-6 dark:border-white/10">
          <p className="text-sm text-muted-foreground">
            No signing token provided. Please initiate signing from the project
            page.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-950/10 bg-background dark:border-white/10">
          <EmbedSignDocument
            token={signingToken}
            host={host}
            onDocumentCompleted={async () => {
              if (flow === "sow" && envelopeId) {
                await markSowSigned(project.id, { envelopeId })
              } else if (scopeChangeId) {
                const scopeChange = project.scopeChanges.find(
                  (change) => change.id === scopeChangeId
                )

                await markChangeOrderSigned(project.id, {
                  documentId,
                  scopeChangeId,
                  amount:
                    typeof amount === "number" && Number.isFinite(amount)
                    ? amount
                    : (scopeChange?.amount ?? 0),
                  description:
                    scopeChange?.description ?? "Signed Change Order",
                })
              }

              router.push(`/projects/${params.id}`)
            }}
            className="h-[80dvh] min-h-[42rem] w-full"
          />
        </div>
      )}
    </div>
  )
}
