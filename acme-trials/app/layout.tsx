import Link from "next/link"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { STUDY } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Acme CTMS — Clinical Trial Management",
  description:
    "Informed consent collection for Phase III Cardio-Renal Study CR-2026-041",
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
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <div className="isolate min-h-dvh bg-background">
            <header className="border-b border-border/80 bg-background">
              <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6">
                <div className="flex min-w-0 items-baseline gap-3">
                  <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight">
                    Acme CTMS
                  </Link>
                  <span className="hidden truncate text-sm text-muted-foreground sm:block">
                    Clinical trial operations demo
                  </span>
                </div>
                <div className="hidden items-center gap-3 text-sm text-muted-foreground md:flex">
                  <span className="font-mono tabular-nums">{STUDY.id}</span>
                  <span className="h-4 w-px bg-border" />
                  <span>Protocol {STUDY.protocolVersion}</span>
                </div>
              </div>
            </header>
            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
