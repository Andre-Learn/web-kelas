import { Suspense, useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import AdminSidebar, { ADMIN_SECTIONS } from '../components/admin/AdminSidebar.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import Icon from '../components/Icon.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { backend } from '../lib/api.js';

function NotAuthorised({ email, onSignOut }) {
  return (
    <div className="admin-gate">
      <div className="admin-gate__card">
        <Icon name="shield" size={24} />
        <h1>No dashboard access</h1>
        <p>
          {email} is signed in but is not an administrator. Ask an existing administrator to grant access.
        </p>
        <button type="button" className="btn" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function AdminCheckFailed({ message, onRetry, onSignOut }) {
  return (
    <div className="admin-gate">
      <div className="admin-gate__card">
        <ErrorState title="Administrator access could not be checked" onRetry={onRetry}>
          {message} This is a connection or configuration problem, not a missing permission.
        </ErrorState>
        <button type="button" className="btn btn--ghost" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const auth = useAuth();
  const { content, status, reload } = useContent();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  if (auth.status === 'loading') return <LoadingState label="Checking your session…" />;
  if (auth.status === 'signed-out') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!auth.isAdmin && auth.error) return <AdminCheckFailed message={auth.error} onRetry={auth.recheck} onSignOut={auth.signOut} />;
  if (!auth.isAdmin) return <NotAuthorised email={auth.user?.email} onSignOut={auth.signOut} />;

  const current = [...ADMIN_SECTIONS].reverse().find((s) => location.pathname.startsWith(s.to)) ?? ADMIN_SECTIONS[0];

  return (
    <ToastProvider>
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <div className="admin">
        <aside className="admin__aside">
          <Link to="/admin" className="admin__brand">
            <span className="navbar__mark" aria-hidden="true">
              XI
            </span>
            <span>
              {content.settings.className}
              <small>Dashboard</small>
            </span>
          </Link>
          <AdminSidebar />
        </aside>

        <div className="admin__main">
          <header className="admin-topbar">
            <button
              type="button"
              className="navbar__menu-btn admin-topbar__menu"
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-nav"
              aria-label={menuOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
            </button>
            <nav aria-label="Breadcrumb" className="breadcrumb admin-topbar__crumbs">
              <ol role="list">
                <li>
                  <Link to="/admin">Dashboard</Link>
                </li>
                {current.to !== '/admin' ? <li aria-current="page">{current.label}</li> : null}
              </ol>
            </nav>
            <div className="admin-topbar__actions">
              <a href="/" target="_blank" rel="noreferrer" className="btn btn--sm btn--ghost admin-topbar__view">
                View site
                <Icon name="external" size={14} />
              </a>
              <ThemeToggle />
              <button type="button" className="theme-toggle" onClick={auth.signOut} aria-label="Sign out" title="Sign out">
                <Icon name="logout" size={18} />
              </button>
            </div>
          </header>

          <AnimatePresence>
            {menuOpen ? (
              <m.div
                id="admin-mobile-nav"
                className="admin-mobile-nav"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                transition={{ duration: 0.2 }}
              >
                <AdminSidebar onNavigate={() => setMenuOpen(false)} />
              </m.div>
            ) : null}
          </AnimatePresence>

          {status === 'error' ? (
            <div className="banner banner--error admin-banner" role="alert">
              <div className="banner__inner">
                <span>
                  <strong>Saved content could not be loaded.</strong> Editing is paused so defaults cannot overwrite published content.
                </span>
                <button type="button" className="btn btn--sm" onClick={reload}>
                  Retry
                </button>
              </div>
            </div>
          ) : null}

          {backend === 'local' ? (
            <div className="banner banner--warning admin-banner" role="note">
              <div className="banner__inner">
                <span>
                  <strong>Local preview.</strong> Supabase is not configured, so changes are stored only in this browser and are not
                  published.
                </span>
              </div>
            </div>
          ) : null}

          <main id="admin-main" className="admin__content" tabIndex={-1}>
            <Suspense fallback={<LoadingState />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
