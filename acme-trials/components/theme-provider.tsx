"use client"

import * as React from "react"

function ThemeProvider({
  children,
}: React.PropsWithChildren) {
  return <>{children}</>
}

export { ThemeProvider }
