import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="border-b border-border/70 bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="Homepage" className="min-w-0">
          <p className="text-lg font-semibold tracking-tight text-foreground">
            Adventure Camp
          </p>
        </Link>

        <p className="text-sm text-muted-foreground">Summer 2026</p>
      </div>
    </header>
  )
}
