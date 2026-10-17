import { useMemo } from 'react';
import ProfileCard from './ProfileCard.jsx';
import { Link } from 'react-router-dom';
import { RevealGroup, RevealItem } from './Reveal.jsx';

const TIER_LABELS = { teacher: 'Homeroom', core: 'Core', officer: 'Officers' };

/**
 * Three-tier organisation drawn as a small network: teacher at the top, core officers below,
 * officers as leaf nodes. Lines are CSS borders. On narrow screens it becomes a tree view with
 * a left connector. Empty tiers collapse.
 */
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

  const rows = [
    { id: 'teacher', people: tiers.teacher, size: 'lg' },
    { id: 'core', people: tiers.core, size: 'md' },
    { id: 'officer', people: tiers.officer, size: 'sm' },
  ].filter((row) => row.people.length);

  return (
    <>
      <div className="topology">
        {rows.map((row, i) => (
          <div key={row.id} className={`topology__tier topology__tier--${row.id} ${i === 0 ? 'topology__tier--root' : ''}`}>
            <p className="topology__label mono">{TIER_LABELS[row.id]}</p>
            <RevealGroup as="ul" role="list" className="topology__nodes">
              {row.people.map((p) => (
                <RevealItem as="li" key={p.id} className="topology__node">
                  <ProfileCard person={p} size={row.size} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        ))}
      </div>

      {tiers.hidden && moreHref ? (
        <p className="structure__more">
          <Link to={moreHref} className="text-link">
            {tiers.hidden} more {tiers.hidden === 1 ? 'officer' : 'officers'} on the full structure page
          </Link>
        </p>
      ) : null}
    </>
  );
}
