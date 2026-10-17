import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'tjkt:theme';

function initialTheme() {
  const fromDom = document.documentElement.dataset.theme;
  if (fromDom === 'light' || fromDom === 'dark') return fromDom;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);
  const [hasChoice, setHasChoice] = useState(() => {
    try {
      return Boolean(localStorage.getItem(THEME_KEY));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#09090B' : '#FAFAFA');
  }, [theme]);

  // Follow OS changes until the visitor picks a theme themselves.
  useEffect(() => {
    if (hasChoice) return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setTheme(e.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [hasChoice]);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 320);
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage unavailable: the choice lasts for this visit only */
      }
      return next;
    });
    setHasChoice(true);
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
