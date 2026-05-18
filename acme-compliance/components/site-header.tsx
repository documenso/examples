"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function SiteHeader({ aside }: { aside?: ReactNode }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const navItems = [
    {
      href: "/#courses",
      label: "Modules",
      active: pathname === "/" || pathname.startsWith("/modules/"),
    },
    {
      href: "/#certifications",
      label: "Certifications",
      active: pathname === "/",
    },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-center justify-between gap-6 py-3">
          <Link href="/" aria-label="Homepage" className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              ACME Compliance
            </p>
          </Link>

          <div className="ml-auto hidden items-center gap-8 lg:flex">
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "border-b border-transparent py-1 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    item.active && "border-foreground/30 text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {aside ? (
              <div className="text-sm text-muted-foreground">{aside}</div>
            ) : null}
          </div>

          <div className="flex items-center lg:hidden">
            <button
              type="button"
              className="relative flex size-9 items-center justify-center text-foreground"
              aria-label={isOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setIsOpen((current) => !current)}
            >
              <span
                className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
                aria-hidden="true"
              />
              {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-border py-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-0 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    item.active && "text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {aside ? (
              <div className="pt-3 text-sm text-muted-foreground">{aside}</div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  )
}
