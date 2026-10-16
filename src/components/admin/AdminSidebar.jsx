import { NavLink } from 'react-router-dom';
import Icon from '../Icon.jsx';

export const ADMIN_SECTIONS = [
  { to: '/admin', label: 'Overview', icon: 'dashboard', end: true },
  { to: '/admin/hero', label: 'Hero', icon: 'hero' },
  { to: '/admin/about', label: 'About', icon: 'info' },
  { to: '/admin/structure', label: 'Structure', icon: 'structure' },
  { to: '/admin/members', label: 'Members', icon: 'users' },
  { to: '/admin/gallery', label: 'Gallery', icon: 'image' },
  { to: '/admin/appearance', label: 'Appearance', icon: 'palette' },
  { to: '/admin/account', label: 'Account', icon: 'shield' },
];

export default function AdminSidebar({ onNavigate }) {
  return (
    <nav className="admin-sidebar" aria-label="Dashboard">
      <ul role="list">
        {ADMIN_SECTIONS.map((s) => (
          <li key={s.to}>
            <NavLink to={s.to} end={s.end} className="admin-sidebar__link" onClick={onNavigate}>
              <Icon name={s.icon} size={18} />
              {s.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
