import { Link } from 'react-router-dom';
import { PUBLIC_ROUTES } from '../data/defaultContent.js';
import { useContent } from '../context/ContentContext.jsx';
import Icon from './Icon.jsx';
import BrandMark from './BrandMark.jsx';

export default function Footer() {
  const { content } = useContent();
  const { className, tagline, school, city, credits } = content.settings;
  const year = new Date().getFullYear();
  const place = [school, city].map((v) => v?.trim()).filter(Boolean).join(', ');

  return (
    <footer className="footer" data-theme="dark">
      <div className="container">
        <div className="footer__top">
          <div className="footer__identity">
            <Link to="/" className="footer__brand">
              <span className="navbar__mark" aria-hidden="true">
                <BrandMark />
              </span>
              <span className="mono">{className}</span>
            </Link>
            <p className="footer__tagline">{tagline}</p>
            {place ? <p className="footer__place mono">{place}</p> : null}
          </div>

          <nav className="footer__nav" aria-label="Footer">
            <p className="footer__label mono">Explore</p>
            <ul role="list">
              {PUBLIC_ROUTES.map((route) => (
                <li key={route.to}>
                  <Link to={route.to}>{route.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {credits?.trim() ? (
          <p className="footer__credits">
            <span className="mono">Made by {className}:</span> {credits.trim()}
          </p>
        ) : null}

        <div className="footer__bottom">
          <p>
            © {year} {className}. Photos are shared with the permission of the people in them.
          </p>
          <button
            type="button"
            className="footer__top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
          >
            Back to top
            <Icon name="arrowUp" size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
