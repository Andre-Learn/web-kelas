import { Link } from 'react-router-dom';
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Icon from './Icon.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { THUMB_SIZE } from '../lib/api.js';

function CtaLink({ href, className, children }) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={href || '/'} className={className}>
      {children}
    </Link>
  );
}

// Indonesian school years start in July.
function schoolYear(now = new Date()) {
  const y = now.getFullYear();
  return now.getMonth() >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

const rise = (delay) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero() {
  const { content, status } = useContent();
  const { className, tagline, heroImage, heroImageThumb, heroAlt, ctaPrimary, ctaSecondary } = content.settings;
  const loading = status === 'loading';
  const count = content.members.length;
  const meta = ['TJKT', 'Grade XI', schoolYear(), !loading && count ? `${count} ${count === 1 ? 'student' : 'students'}` : null].filter(Boolean);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, reduce ? 0 : 80]);
  const scale = useTransform(scrollY, [0, 800], [1.04, reduce ? 1.04 : 1.1]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <m.div className="hero__media" style={{ y, scale }}>
        {heroImage ? (
          <img
            src={heroImage}
            // The thumbnail is a real smaller rendition of the same upload; the full file is 1920 px wide at most.
            srcSet={heroImageThumb ? `${heroImageThumb} ${THUMB_SIZE}w, ${heroImage} 1920w` : undefined}
            sizes={heroImageThumb ? '100vw' : undefined}
            alt={heroAlt || `${className} class photo`}
            fetchpriority="high"
            decoding="async"
          />
        ) : loading ? (
          <div className="hero__placeholder" aria-hidden="true" />
        ) : (
          <div className="hero__placeholder" role="img" aria-label="Class photo placeholder. An administrator can add the photo from the dashboard.">
            <span className="hero__placeholder-note">
              <Icon name="image" size={16} />
              Class photo coming soon
            </span>
          </div>
        )}
      </m.div>
      <div className="hero__scrim" aria-hidden="true" />

      <div className="container hero__content">
        <m.p className="hero__meta" {...rise(0.05)}>
          {meta.map((item, i) => (
            <span key={item}>
              {i ? <span aria-hidden="true"> · </span> : null}
              {item}
            </span>
          ))}
        </m.p>
        <m.h1 id="hero-title" className="hero__title" {...rise(0.12)}>
          {className}
        </m.h1>
        <m.p className="hero__tagline" {...rise(0.22)}>
          {tagline}
        </m.p>
        <m.div className="hero__actions" {...rise(0.32)}>
          <CtaLink href={ctaPrimary.href} className="btn btn--on-photo">
            {ctaPrimary.label}
            <Icon name="arrowRight" size={18} />
          </CtaLink>
          <CtaLink href={ctaSecondary.href} className="hero__link">
            {ctaSecondary.label}
          </CtaLink>
        </m.div>
      </div>

      <a href="#about" className="hero__scroll" aria-label="Scroll to About section">
        <span className="hero__scroll-line" aria-hidden="true" />
        <span className="hero__scroll-label">Scroll</span>
      </a>
    </section>
  );
}
