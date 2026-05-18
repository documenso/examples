import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

export function PageShell({
  className,
  ...props
}: ComponentPropsWithoutRef<"main">) {
  return (
    <main
      className={cn(
        "isolate mx-auto min-h-dvh w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8",
        className
      )}
      {...props}
    />
  )
}
