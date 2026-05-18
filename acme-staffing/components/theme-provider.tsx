"use client"

import * as React from "react"

const THEME_STORAGE_KEY = "theme"
const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = Exclude<Theme, "system">

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(THEME_MEDIA_QUERY).matches ? "dark" : "light"
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme
}

function applyTheme(theme: Theme) {
  const resolvedTheme = resolveTheme(theme)
  const root = document.documentElement

  root.classList.toggle("dark", resolvedTheme === "dark")
  root.dataset.theme = theme
  root.dataset.resolvedTheme = resolvedTheme
  root.style.colorScheme = resolvedTheme

  return resolvedTheme
}

function getInitialTheme(defaultTheme: Theme, storageKey: string) {
  if (typeof document !== "undefined") {
    const datasetTheme = document.documentElement.dataset.theme

    if (isTheme(datasetTheme)) {
      return datasetTheme
    }
  }

  if (typeof window === "undefined") {
    return defaultTheme
  }

  const storedTheme = window.localStorage.getItem(storageKey)

  return isTheme(storedTheme) ? storedTheme : defaultTheme
}

function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] =
    React.useState<ResolvedTheme>("light")

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)
      window.localStorage.setItem(storageKey, nextTheme)
      setResolvedTheme(applyTheme(nextTheme))
    },
    [storageKey]
  )

  React.useEffect(() => {
    const initialTheme = getInitialTheme(defaultTheme, storageKey)

    setThemeState(initialTheme)
    setResolvedTheme(applyTheme(initialTheme))
  }, [defaultTheme, storageKey])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY)

    function handleChange() {
      if (theme !== "system") {
        return
      }

      setResolvedTheme(applyTheme("system"))
    }

    handleChange()
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}

export { ThemeProvider, useTheme }
