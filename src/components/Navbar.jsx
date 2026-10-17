import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import Icon from './Icon.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { PUBLIC_ROUTES } from '../data/defaultContent.js';
import { useContent } from '../context/ContentContext.jsx';

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

export default function Navbar() {
  const { content } = useContent();
  const { pathname } = useLocation();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  const overPhoto = pathname === '/' && !scrolled && !open;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    root.classList.add('is-locked');
    const trigger = toggleRef.current;
    // Everything outside the header is inert while the menu is open.
    const outside = [...(document.getElementById('root')?.children ?? [])].filter((el) => !el.contains(trigger));
    outside.forEach((el) => el.setAttribute('inert', ''));

    const focusables = () => [trigger, ...(panelRef.current?.querySelectorAll('a[href], button:not([disabled])') ?? [])].filter(Boolean);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      // Trap Tab inside the trigger and the panel.
      const list = focusables();
      const first = list[0];
      const last = list[list.length - 1];
      if (!list.includes(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => window.innerWidth >= 900 && setOpen(false);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    panelRef.current?.querySelector('a')?.focus();
    return () => {
      root.classList.remove('is-locked');
      outside.forEach((el) => el.removeAttribute('inert'));
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      // Return focus to the trigger unless navigation moved it somewhere meaningful.
      if (!document.activeElement || document.activeElement === document.body || panelRef.current?.contains(document.activeElement)) {
        trigger?.focus({ preventScroll: true });
      }
    };
  }, [open]);

  return (
    <header className={`navbar ${overPhoto ? 'navbar--over-photo' : 'navbar--glass'} ${open ? 'navbar--open' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" aria-label={`${content.settings.className}, home`}>
          <span className="navbar__mark" aria-hidden="true">
            XI
          </span>
          <span className="navbar__name">{content.settings.className}</span>
        </Link>

        <nav className="navbar__nav" aria-label="Main">
          <ul role="list" className="navbar__links">
            {PUBLIC_ROUTES.map((route) => (
              <li key={route.to}>
                <NavLink to={route.to} end={route.to === '/'} className="navbar__link">
                  {route.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            className="navbar__menu-btn"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <m.div
              className="mobile-nav__scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <m.nav
              id="mobile-nav"
              ref={panelRef}
              className="mobile-nav"
              aria-label="Main"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <ul role="list" className="container mobile-nav__list">
                {PUBLIC_ROUTES.map((route) => (
                  <li key={route.to}>
                    <NavLink
                      to={route.to}
                      end={route.to === '/'}
                      className="mobile-nav__link"
                      onClick={() => setOpen(false)}
                    >
                      {route.label}
                      <Icon name="chevronRight" size={18} />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </m.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
