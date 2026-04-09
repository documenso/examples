"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AppHeaderProps = {
  backHref?: string
  backLabel?: string
  className?: string
}

export function AppHeader({
  backHref,
  backLabel = "Back",
  className,
}: AppHeaderProps) {
  return (
    <header className={cn("border-b border-border/60", className)}>
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-5 sm:px-6">
        <Link
          href="/"
          aria-label="Homepage"
          className="text-[0.95rem] font-medium tracking-tight text-foreground"
        >
          Acme Insure
        </Link>

        {backHref ? (
          <>
            <div className="h-4 w-px bg-border/80" />
            <Link
              href={backHref}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground"
              )}
            >
              <ArrowLeft className="size-4 shrink-0" />
              {backLabel}
            </Link>
          </>
        ) : null}
      </div>
    </header>
  )
}
