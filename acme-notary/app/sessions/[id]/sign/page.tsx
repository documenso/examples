import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Stamp } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/mock-data"
import { SigningSession } from "@/components/signing-session"

export default async function SignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = getSession(id)
  if (!session) notFound()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-3">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stamp className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">
              Notarization Session
            </h1>
            <p className="text-xs text-muted-foreground">
              {session.clientName} — {session.documentType}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <SigningSession session={session} />
      </main>
    </div>
  )
}
