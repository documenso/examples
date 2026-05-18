import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { LeasingSessionProvider } from "@/components/leasing-session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Acme Leasing — Tenant Portal",
  description: "Sign your lease packet and complete move-in documents online.",
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
      <body className="isolate">
        <ThemeProvider>
          <LeasingSessionProvider>{children}</LeasingSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
