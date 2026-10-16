import { Link } from 'react-router-dom'
import { ROUTES } from '../lib/routes'
import { CLASS_PROFILE } from '../data/placeholders'

const LINKS = [
  { to: ROUTES.home, label: 'Home' },
  { to: ROUTES.structure, label: 'Structure' },
  { to: ROUTES.members, label: 'Members' },
  { to: ROUTES.gallery, label: 'Gallery' },
  { to: ROUTES.about, label: 'About' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-brand">{CLASS_PROFILE.name}</p>
          <p className="footer-tagline">{CLASS_PROFILE.tagline}</p>
        </div>
        <nav aria-label="Navigasi footer" className="footer-nav">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to}>{link.label}</Link>
          ))}
        </nav>
      </div>
      <div className="container footer-legal">
        <p>© {new Date().getFullYear()} {CLASS_PROFILE.name}</p>
      </div>
    </footer>
  )
}
