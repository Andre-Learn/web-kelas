import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../lib/routes'
import { useTheme } from '../theme/ThemeProvider'

const LINKS = [
  { to: ROUTES.home, label: 'Home' },
  { to: ROUTES.structure, label: 'Structure' },
  { to: ROUTES.members, label: 'Members' },
  { to: ROUTES.gallery, label: 'Gallery' },
  { to: ROUTES.about, label: 'About' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const glass = scrolled || menuOpen

  return (
    <header className={`navbar ${glass ? 'navbar-glass' : ''}`}>
      <div className="container navbar-inner">
        <Link to={ROUTES.home} className="brand" onClick={() => setMenuOpen(false)}>
          XI TJKT-1
        </Link>

        <nav aria-label="Navigasi utama" className="desktop-nav">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === ROUTES.home}>
              {link.label}
            </NavLink>
          ))}
          <button type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'} className="theme-toggle">
            {theme === 'dark' ? 'Terang' : 'Gelap'}
          </button>
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Tutup' : 'Menu'}
        </button>
      </div>

      <nav id="mobile-nav" aria-label="Navigasi utama" className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === ROUTES.home} onClick={() => setMenuOpen(false)}>
            {link.label}
          </NavLink>
        ))}
        <button type="button" onClick={toggleTheme} className="theme-toggle">
          {theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
        </button>
      </nav>
    </header>
  )
}
