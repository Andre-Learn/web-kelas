import { createContext, useContext, useEffect, useState } from 'react'
import { applyTheme, getInitialTheme, readStoredTheme, STORAGE_KEY } from './themeStorage'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // index.html already painted the right theme; state just mirrors it.
  const [theme, setTheme] = useState(getInitialTheme())

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    function onSystemChange(event) {
      // Follow the OS only while the visitor has not picked a side.
      if (!readStoredTheme()) {
        setTheme(event.matches ? 'dark' : 'light')
        applyTheme(event.matches ? 'dark' : 'light')
      }
    }
    media.addEventListener('change', onSystemChange)
    return () => media.removeEventListener('change', onSystemChange)
  }, [])

  function toggleTheme() {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, readStoredTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
