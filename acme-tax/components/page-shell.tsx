import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

export function PageShell({
  className,
  ...props
}: ComponentPropsWithoutRef<"main">) {
  return (
    <main
      className={cn("mx-auto min-h-screen w-full max-w-4xl px-6 py-10", className)}
      {...props}
    />
  )
}
