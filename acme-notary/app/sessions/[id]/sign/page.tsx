import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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
      <header className="border-b border-zinc-950/5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-base/6 text-zinc-500 hover:text-zinc-950 sm:text-sm/6"
          >
            <ArrowLeft className="size-4 shrink-0" />
            Sessions
          </Link>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-950">Acme Notary</p>
              <div className="space-y-1">
                <h1 className="max-w-[20ch] text-3xl font-semibold tracking-tight text-balance text-zinc-950">
                  Notarization session
                </h1>
                <p className="max-w-[56ch] text-base/7 text-pretty text-zinc-500 sm:text-sm/6">
                  {session.clientName} · {session.documentType}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-base/6 text-zinc-500 sm:text-sm/6">
              <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <SigningSession session={session} />
      </main>
    </div>
  )
}
