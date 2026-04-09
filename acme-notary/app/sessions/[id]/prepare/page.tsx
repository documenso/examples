import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Stamp } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
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
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stamp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">
              Prepare Document
            </h1>
            <p className="text-xs text-muted-foreground">
              {session.clientName} — {session.documentType}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <PrepareDocument session={session} />
      </main>
    </div>
  )
}
