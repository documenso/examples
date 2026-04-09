"use client"

import { MoonStar, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme !== "light"

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="h-9 rounded-full border-border/70 bg-background/70 px-3 text-sm backdrop-blur-sm"
    >
      <SunMedium className="hidden size-4 dark:block" />
      <MoonStar className="size-4 dark:hidden" />
      <span>Toggle theme</span>
    </Button>
  )
}
