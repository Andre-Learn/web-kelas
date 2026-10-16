import { Link } from 'react-router-dom'
import { ROUTES } from '../lib/routes'
import { CLASS_PROFILE } from '../data/placeholders'
import { originalSrc, classPhotoFallback } from '../lib/images'

/* Hero photo ships as /img/hero.jpg with a matching -thumb for small screens;
   the fallback SVG renders when the real photo is not uploaded yet. */
export default function Hero() {
  const photo = originalSrc('hero')
  const fallback = classPhotoFallback('hero', CLASS_PROFILE.name)
  return (
    <section className="hero" aria-labelledby="hero-title">
      <img
        className="hero-photo"
        src={photo}
        onError={(event) => { event.currentTarget.src = fallback }}
        alt=""
        width={1600}
        height={900}
        fetchpriority="high"
        decoding="async"
      />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="container hero-content">
        <h1 id="hero-title">{CLASS_PROFILE.name}</h1>
        <p className="hero-tagline">{CLASS_PROFILE.tagline}</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to={ROUTES.structure}>Kenali Kelas Kami</Link>
          <Link className="btn btn-ghost" to={ROUTES.gallery}>Jelajahi Memori</Link>
        </div>
      </div>
    </section>
  )
}
