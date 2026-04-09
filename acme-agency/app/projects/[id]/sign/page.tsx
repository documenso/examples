"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, FileText } from "lucide-react"
import { EmbedSignDocument } from "@documenso/embed-react"

export default function SignChangeOrderPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const signingToken = searchParams.get("token")

  const host =
    process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href={`/projects/${params.id}`}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Sign Change Order
          </h1>
          <p className="text-muted-foreground text-sm">
            Review and sign the change order for this project.
          </p>
        </div>
      </div>

      {!signingToken ? (
        <div className="flex h-[600px] items-center justify-center rounded-lg border">
          <p className="text-muted-foreground text-sm">
            No signing token provided. Please initiate signing from the project
            page.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <EmbedSignDocument
            token={signingToken}
            host={host}
            onDocumentCompleted={() => {
              window.location.href = `/projects/${params.id}`
            }}
            className="h-[600px] w-full"
          />
        </div>
      )}
    </div>
  )
}
