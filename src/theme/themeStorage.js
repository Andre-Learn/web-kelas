const STORAGE_KEY = 'theme'

function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
}

export function readStoredTheme() {
  return localStorage.getItem(STORAGE_KEY)
}

export { STORAGE_KEY, getInitialTheme }
