import { Geist, Geist_Mono } from "next/font/google"
import Image from "next/image"
import Link from "next/link"

import "./globals.css"
import { ThemeProvider, ThemeToggle } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Acme Gig — Freelancer Marketplace",
  description: "Hire top creative talent with instant contract signing",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body className="min-h-svh bg-background text-foreground">
        <ThemeProvider>
          <div className="flex min-h-svh flex-col">
            <header className="border-b border-zinc-950/8 dark:border-white/10">
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-5 lg:px-8">
                <Link
                  href="/"
                  aria-label="Homepage"
                  className="flex items-center gap-3 text-base font-medium tracking-tight sm:text-sm"
                >
                  <Image
                    src="https://assets.ui.sh/marks/1.svg?color=zinc-950"
                    alt=""
                    width={28}
                    height={28}
                    unoptimized
                    className="size-7 shrink-0 dark:grayscale dark:invert"
                  />
                  <span>Acme Gig</span>
                </Link>
                <div className="flex items-center gap-2 sm:gap-3">
                  <nav className="flex items-center gap-4 text-base text-zinc-600 sm:gap-5 sm:text-sm dark:text-zinc-300">
                    <Link
                      href="/"
                      className="outline-none focus-visible:underline"
                    >
                      Browse
                    </Link>
                    <Link
                      href="/#process"
                      className="outline-none focus-visible:underline"
                    >
                      How it works
                    </Link>
                  </nav>
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="isolate flex-1">{children}</main>
            <footer className="border-t border-zinc-950/8 dark:border-white/10">
              <div className="mx-auto max-w-5xl px-6 py-4 lg:px-8">
                <p className="text-base/7 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                  Press D to toggle theme.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
