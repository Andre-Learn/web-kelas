import { useEffect, useMemo, useRef, useState } from 'react';
import Photo from './Photo.jsx';
import { LEVEL_LABELS, buildOrgChart } from '../lib/orgChart.js';

/** Becomes true once, the first time the chart scrolls into view. It never goes back, so the entrance plays once. */
function useRevealOnce() {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    const el = ref.current;
    if (revealed || !el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);
  return [ref, revealed];
}

/**
 * Entrance sequence in seconds: teacher, then the lines to the next level, then that level's people one by one,
 * and so on down. The whole sequence is squeezed to 1.5s at most so information is never kept waiting.
 */
function planMotion(levels) {
  const STEP = 0.07;
  let t = 0;
  const plan = levels.map((level, depth) => {
    const line = depth === 0 ? 0 : t;
    if (depth > 0) t += 0.2;
    const people = {};
    let n = 0;
    level.groups.forEach((group) =>
      group.people.forEach((person) => {
        people[person.id] = t + n * STEP;
        n += 1;
      }),
    );
    t += Math.max(0, n - 1) * STEP + 0.18;
    return { line, people };
  });
  const scale = t > 1.5 ? 1.5 / t : 1;
  return plan.map(({ line, people }) => ({
    line: line * scale,
    people: Object.fromEntries(Object.entries(people).map(([id, at]) => [id, at * scale])),
  }));
}

function OrgNode({ person }) {
  const hasName = Boolean(person.name?.trim());
  return (
    <article className="org-node">
      <Photo
        src={person.photo}
        alt={hasName ? `Portrait of ${person.name}` : ''}
        name={person.name}
        fallback="person"
        ratio="1 / 1"
        width={192}
        height={192}
        className="org-node__photo"
      />
      <div className="org-node__body">
        <h4 className={`org-node__name ${hasName ? '' : 'org-node__name--empty'}`}>{hasName ? person.name : 'Not yet announced'}</h4>
        <p className="org-node__role mono">{person.role}</p>
        {person.description ? <p className="org-node__desc">{person.description}</p> : null}
      </div>
    </article>
  );
}

function OrgLevel({ levels, plan, depth }) {
  const level = levels[depth];
  const motion = plan[depth];
  // Wide levels stack each group's deputies under the primary position so every group stays one card wide:
  // more than four cards in a row on larger screens, more than two on phones (the leadership pair stays side by side).
  const cards = level.groups.reduce((n, group) => n + group.people.length, 0);
  return (
    <div className={`org__level ${depth === 0 ? 'org__level--root' : 'org__level--nested'} ${cards > 4 ? 'org__level--stacked' : ''} ${cards > 2 ? 'org__level--stacked-sm' : ''}`} style={{ '--line-d': `${motion.line.toFixed(2)}s` }}>
      <h3 className="sr-only">{LEVEL_LABELS[level.tier]}</h3>
      <ul role="list" className="org__groups">
        {level.groups.map((group) => (
          <li key={group.key} className="org__group">
            <div className={`org__frame ${group.label ? '' : 'org__frame--plain'}`} role={group.label ? 'group' : undefined} aria-label={group.label || undefined}>
              {group.label ? <p className="org__group-label mono">{group.label}</p> : null}
              <ul role="list" className="org__people">
                {group.people.map((person) => (
                  <li key={person.id} className="org__person" style={{ '--d': `${(motion.people[person.id] ?? 0).toFixed(2)}s` }}>
                    <OrgNode person={person} />
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
      {depth + 1 < levels.length ? <OrgLevel levels={levels} plan={plan} depth={depth + 1} /> : null}
    </div>
  );
}

/**
 * Organisation chart generated from the saved officers: levels (tier), framed groups (group name) and deputies.
 * New positions appear here as soon as they are saved; no position is named in this file.
 */
export default function StructureChart({ officers }) {
  const levels = useMemo(() => buildOrgChart(officers), [officers]);
  const plan = useMemo(() => planMotion(levels), [levels]);
  const [ref, revealed] = useRevealOnce();
  if (!levels.length) return null;
  return (
    <div ref={ref} className="org" data-revealed={revealed ? 'true' : 'false'} role="region" aria-label="Class organisation chart" tabIndex={0}>
      <OrgLevel levels={levels} plan={plan} depth={0} />
    </div>
  );
}
