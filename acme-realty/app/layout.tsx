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

export const metadata = {
  title: "Acme Realty — Transaction Management",
  description:
    "Brokerage transaction tool for managing purchase agreements, multi-party signing, and custom addendums.",
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
          <div className="min-h-dvh bg-background">
            <header className="border-b border-border/80">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
                <Link
                  href="/"
                  aria-label="Homepage"
                  className="text-sm font-semibold tracking-[0.08em] text-foreground"
                >
                  ACME REALTY
                </Link>
                <nav className="flex items-center gap-6 text-sm text-muted-foreground">
                  <Link href="/" className="text-foreground">
                    Transactions
                  </Link>
                </nav>
              </div>
            </header>
            <main className="isolate">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
