import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FIRM_NAME } from "@/lib/acme-legal"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: `${FIRM_NAME} | Legal Services`,
  description:
    "Professional legal services. Client intake and document management powered by Documenso.",
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
      <body className="min-h-dvh bg-background text-foreground">
        <ThemeProvider>
          <div className="isolate min-h-dvh">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
