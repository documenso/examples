"use client"

import * as React from "react"
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
} from "next-themes"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider, useTheme }
