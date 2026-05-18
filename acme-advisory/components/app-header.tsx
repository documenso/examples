import Link from "next/link"
import { FIRM_NAME } from "@/lib/mock-clients"
import { cn } from "@/lib/utils"

type AppHeaderProps = {
  subtitle: string
  containerClassName?: string
  meta?: string
}

export function AppHeader({
  subtitle,
  containerClassName,
  meta = "Documenso advisory demo",
}: AppHeaderProps) {
  return (
    <header className="border-b border-border/70 bg-background">
      <div
        className={cn(
          "mx-auto flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-end sm:justify-between",
          containerClassName
        )}
      >
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">RIA onboarding desk</p>
          <Link href="/" aria-label="Homepage" className="w-fit">
            <p className="text-xl font-semibold tracking-tight">{FIRM_NAME}</p>
          </Link>
        </div>

        <div className="flex flex-col gap-1 text-left sm:text-right">
          <p className="text-sm font-medium text-foreground">{subtitle}</p>
          <p className="text-sm text-muted-foreground">{meta}</p>
        </div>
      </div>
    </header>
  )
}
