import { useMemo } from 'react';
import ProfileCard from './ProfileCard.jsx';
import { Link } from 'react-router-dom';
import { RevealGroup, RevealItem } from './Reveal.jsx';

/** Three-tier organisation: teacher, core officers, other officers. Empty tiers collapse. */
export default function StructureChart({ officers, limit, moreHref }) {
  const tiers = useMemo(() => {
    const by = (tier) => officers.filter((o) => o.tier === tier);
    const officerTier = by('officer');
    return {
      teacher: by('teacher'),
      core: by('core'),
      officer: limit ? officerTier.slice(0, limit) : officerTier,
      hidden: limit ? Math.max(0, officerTier.length - limit) : 0,
    };
  }, [officers, limit]);

  return (
    <div className="structure">
      {tiers.teacher.length ? (
        <RevealGroup className="structure__tier structure__tier--teacher">
          {tiers.teacher.map((p) => (
            <RevealItem key={p.id}>
              <ProfileCard person={p} size="lg" />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : null}

      {tiers.core.length ? (
        <RevealGroup className="structure__tier structure__tier--core">
          {tiers.core.map((p) => (
            <RevealItem key={p.id}>
              <ProfileCard person={p} />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : null}

      {tiers.officer.length ? (
        <RevealGroup className="structure__tier structure__tier--officer">
          {tiers.officer.map((p) => (
            <RevealItem key={p.id}>
              <ProfileCard person={p} size="sm" />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : null}

      {tiers.hidden && moreHref ? (
        <p className="structure__more">
          <Link to={moreHref} className="text-link">
            {tiers.hidden} more {tiers.hidden === 1 ? 'officer' : 'officers'} on the full structure page
          </Link>
        </p>
      ) : null}
    </div>
  );
}
