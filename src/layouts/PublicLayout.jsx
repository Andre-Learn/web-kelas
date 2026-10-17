import { Suspense } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { LoadingState } from '../components/States.jsx';
import { useContent } from '../context/ContentContext.jsx';

const EASE = [0.22, 1, 0.36, 1];

// Short and small: enough to mark the change of page without delaying navigation.
// Under prefers-reduced-motion, MotionConfig (main.jsx) drops the y movement and keeps the fade.
const page = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.14, ease: 'easeIn' } },
};

export default function PublicLayout() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const { status, error, reload } = useContent();

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
      <main id="main" tabIndex={-1}>
        <AnimatePresence
          mode="wait"
          initial={false}
          onExitComplete={() => {
            if (!window.location.hash) window.scrollTo(0, 0);
          }}
        >
          {/* Keyed by path only, so search params and hash changes do not remount the page. */}
          <m.div key={pathname} variants={page} initial="initial" animate="animate" exit="exit">
            <Suspense
              fallback={
                <div className="route-loading">
                  <LoadingState />
                </div>
              }
            >
              {outlet}
            </Suspense>
          </m.div>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
