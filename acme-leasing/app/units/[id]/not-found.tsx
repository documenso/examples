import Link from "next/link"
import { ArrowLeft, Building2 } from "lucide-react"

export default function UnitNotFound() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <Link
            href="/"
            aria-label="Homepage"
            className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <Building2 className="size-6 shrink-0 stroke-primary" />
            <h1 className="text-xl font-semibold tracking-tight text-balance">
              Acme Leasing
            </h1>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-24">
        <h2 className="max-w-[20ch] text-2xl font-semibold text-balance">
          Unit not found
        </h2>
        <p className="mt-2 max-w-[56ch] text-sm text-muted-foreground text-pretty">
          The unit you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
        >
          <ArrowLeft className="mr-2 size-4 shrink-0" />
          Back to units
        </Link>
      </main>
    </div>
  )
}
