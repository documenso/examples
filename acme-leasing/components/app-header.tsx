import Link from "next/link"

interface AppHeaderProps {
  context: string
}

export function AppHeader({ context }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          aria-label="Homepage"
          className="inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <span className="text-base font-semibold tracking-tight">Acme Leasing</span>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">Residential leasing</span>
        </Link>

        <p className="text-sm text-muted-foreground">{context}</p>
      </div>
    </header>
  )
}
