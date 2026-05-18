import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const themeScript = String.raw`try {
  const storageKey = "theme"
  const storedTheme = localStorage.getItem(storageKey)
  const theme =
    storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
      ? storedTheme
      : "system"
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
  const resolvedTheme = theme === "system" ? systemTheme : theme
  const root = document.documentElement

  root.classList.toggle("dark", resolvedTheme === "dark")
  root.dataset.theme = theme
  root.dataset.resolvedTheme = resolvedTheme
  root.style.colorScheme = resolvedTheme
} catch {}
`

export const metadata = {
  title: "Acme Staffing — Placement Management",
  description:
    "Manage contractor placements with embedded document signing powered by Documenso.",
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
      <body className="min-h-svh bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ThemeProvider>
          <div className="isolate min-h-svh">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
