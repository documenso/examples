import Link from "next/link"
import { FIRM_NAME } from "@/lib/acme-legal"

export function AppHeader() {
  return (
    <header className="border-b border-zinc-950/5 bg-background/95">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Homepage"
          className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          {FIRM_NAME}
        </Link>
      </div>
    </header>
  )
}
