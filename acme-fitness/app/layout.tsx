import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "AcmeFitness Waiver Kiosk",
  description:
    "Gym kiosk for walk-in visitors to scan a QR code and sign a liability waiver.",
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
        "scheme-only-dark dark antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-dvh bg-background text-foreground isolate">
        {children}
      </body>
    </html>
  )
}
