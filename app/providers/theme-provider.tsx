import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage, writeStorage } from '~/shared/lib/storage'

export type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function ThemeProvider({
  children,
  defaultTheme = 'light'
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  // Đồng bộ với localStorage / class trên <html> sau khi hydrate.
  // setState trong effect ở đây là CHỦ Ý: server render với defaultTheme,
  // client mount xong mới đọc được localStorage / matchMedia và update.
  // Không thể đưa lên useState lazy init vì sẽ gây hydration mismatch.
  useEffect(() => {
    const stored = readStorage(STORAGE_KEYS.theme) as Theme | null
    const initial: Theme = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial)
    applyThemeClass(initial)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyThemeClass(next)
    writeStorage(STORAGE_KEYS.theme, next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

/**
 * Script chạy đồng bộ trong <head> để áp class `dark` TRƯỚC khi React
 * hydrate. Mục đích: tránh flash màu sai (FOUC).
 */
export const themeInitScript = `
(function () {
  try {
    var key='${STORAGE_KEYS.theme}';
    var stored = localStorage.getItem(key);
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored ? stored : (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (_) {}
})();
`
