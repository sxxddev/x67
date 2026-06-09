'use client'

import * as React from 'react'

type ThemeContextValue = {
  themes: string[]
  theme?: string
  setTheme: React.Dispatch<React.SetStateAction<string>>
  forcedTheme?: string
  resolvedTheme?: string
  systemTheme?: 'dark' | 'light'
}

const ThemeContext = React.createContext<ThemeContextValue>({
  setTheme: () => {},
  themes: ['light', 'dark', 'system'],
})

export function useTheme() {
  return React.useContext(ThemeContext)
}

type ThemeProviderProps = {
  children: React.ReactNode
  forcedTheme?: string
  defaultTheme?: string
  attribute?: string
  disableTransitionOnChange?: boolean
  enableSystem?: boolean
}

function resolveTheme(theme: string): 'light' | 'dark' {
  if (theme === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme === 'light' ? 'light' : 'dark'
}

function applyThemeClass(resolved: 'light' | 'dark') {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)
  document.documentElement.style.colorScheme = resolved
}

export function ThemeProvider({
  children,
  forcedTheme = 'dark',
  defaultTheme = 'dark',
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState(defaultTheme)
  const activeTheme = forcedTheme ?? theme
  const resolvedTheme = resolveTheme(activeTheme)

  React.useEffect(() => {
    applyThemeClass(forcedTheme ? resolveTheme(forcedTheme) : resolvedTheme)
  }, [activeTheme, forcedTheme, resolvedTheme])

  React.useEffect(() => {
    if (forcedTheme) return
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme, forcedTheme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      themes: ['light', 'dark', 'system'],
      theme: activeTheme,
      setTheme,
      forcedTheme,
      resolvedTheme: forcedTheme ?? resolvedTheme,
      systemTheme:
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
    }),
    [activeTheme, forcedTheme, resolvedTheme, theme]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}
