import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/lib/mock-data"
import { PrepareDocument } from "@/components/prepare-document"

export default async function PreparePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = getSession(id)
  if (!session) notFound()

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-base/6 text-muted-foreground hover:text-foreground sm:text-sm/6"
          >
            <ArrowLeft className="size-4 shrink-0" />
            Sessions
          </Link>
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-foreground">Acme Notary</p>
            <div className="space-y-1">
              <h1 className="max-w-[20ch] text-3xl font-semibold tracking-tight text-balance text-foreground">
                Prepare document
              </h1>
              <p className="max-w-[56ch] text-base/7 text-pretty text-muted-foreground sm:text-sm/6">
                {session.clientName} · {session.documentType}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <PrepareDocument session={session} />
      </main>
    </div>
  )
}
