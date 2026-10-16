import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { m } from 'framer-motion';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useContent } from '../context/ContentContext.jsx';

export default function PublicLayout() {
  const { pathname, hash } = useLocation();
  const { status, error, reload } = useContent();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      {status === 'error' ? (
        <div className="banner banner--error" role="alert">
          <div className="container banner__inner">
            <span>Latest content could not be loaded. {error}</span>
            <button type="button" className="btn btn--sm" onClick={reload}>
              Retry
            </button>
          </div>
        </div>
      ) : null}
      <m.main
        id="main"
        key={pathname}
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <Outlet />
      </m.main>
      <Footer />
    </>
  );
}
