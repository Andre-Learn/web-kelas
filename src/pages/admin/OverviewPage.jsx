import { Link } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import SummaryCard from '../../components/admin/SummaryCard.jsx';
import Photo from '../../components/Photo.jsx';
import Icon from '../../components/Icon.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import { ADMIN_SECTIONS } from '../../components/admin/AdminSidebar.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';

export default function OverviewPage() {
  useDocumentTitle('Dashboard');
  const { content } = useContent();
  const { members, officers, gallery, settings } = content;
  const filledOfficers = officers.filter((o) => o.name.trim()).length;

  return (
    <>
      <AdminPageHeader title="Overview" description="A summary of what is currently published on the class website." />

      <div className="summary-grid">
        <SummaryCard icon="users" label="Members" value={members.length}>
          <Link to="/admin/members" className="summary-card__link">
            Manage members
          </Link>
        </SummaryCard>
        <SummaryCard icon="structure" label="Officers" value={`${filledOfficers}/${officers.length}`}>
          <p className="summary-card__note">Roles with a name assigned</p>
          <Link to="/admin/structure" className="summary-card__link">
            Manage structure
          </Link>
        </SummaryCard>
        <SummaryCard icon="image" label="Gallery images" value={gallery.length}>
          <Link to="/admin/gallery" className="summary-card__link">
            Manage gallery
          </Link>
        </SummaryCard>
        <SummaryCard icon="hero" label="Current hero image">
          <Photo src={settings.heroImageThumb || settings.heroImage} alt="" ratio="16 / 9" className="summary-card__photo" />
          <Link to="/admin/hero" className="summary-card__link">
            {settings.heroImage ? 'Change hero' : 'Add a hero photo'}
          </Link>
        </SummaryCard>
      </div>

      <section className="admin-panel" aria-labelledby="shortcuts-title">
        <h2 id="shortcuts-title" className="admin-panel__title">
          Sections
        </h2>
        <ul role="list" className="shortcut-list">
          {ADMIN_SECTIONS.slice(1).map((s) => (
            <li key={s.to}>
              <Link to={s.to} className="shortcut">
                <Icon name={s.icon} size={18} />
                {s.label}
                <Icon name="chevronRight" size={16} className="shortcut__chev" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
