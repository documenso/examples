import type { Metadata } from "next"
import Link from "next/link"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Acme Agency — Client Portal",
  description:
    "Manage projects, author statements of work, and sign change orders.",
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
      <body className="min-h-dvh bg-background text-foreground">
        <ThemeProvider>
          <div className="min-h-dvh">
            <header className="border-b border-zinc-950/10 dark:border-white/10">
              <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
                <Link
                  href="/"
                  aria-label="Homepage"
                  className="text-sm font-medium"
                >
                  Acme Agency
                </Link>
                <p className="text-sm text-muted-foreground">Client portal</p>
              </div>
            </header>
            <main className="isolate">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
