import { Figtree, Geist_Mono } from "next/font/google"

import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-body" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-code",
})

export const metadata = {
  title: "Adventure Camp 2026 — Registration",
  description:
    "Register your child for Adventure Camp 2026. Outdoor activities, team building, and unforgettable summer memories.",
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
        figtree.variable,
        fontMono.variable,
        "font-sans",
      )}
    >
      <body>
        <ThemeProvider>
          <div className="flex min-h-svh flex-col bg-background text-foreground">
            <SiteHeader />
            <main className="isolate flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
