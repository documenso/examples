"use client"

import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

type PageShellProps = ComponentPropsWithoutRef<"main">

export function PageShell({ className, ...props }: PageShellProps) {
  return (
    <main
      className={cn("mx-auto w-full max-w-6xl px-6 py-10 lg:px-8", className)}
      {...props}
    />
  )
}
