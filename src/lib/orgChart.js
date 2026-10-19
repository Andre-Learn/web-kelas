/*
 * Turns the flat officers list into the levels, groups and people of the organisation chart.
 * Nothing here names a position: the chart is built from three saved fields.
 *   tier       -> the level (teacher, core, officer), top to bottom
 *   groupName  -> officers sharing a name inside one level are drawn in one framed group
 *   isDeputy   -> a deputy is listed after the primary position(s) of its group
 * The saved sort order decides the order of groups (by their first member) and of people inside a group.
 */
export const LEVELS = ['teacher', 'core', 'officer'];

export const LEVEL_LABELS = { teacher: 'Homeroom teacher', core: 'Class leadership', officer: 'Officers' };

const orderOf = (person, index) => (Number.isFinite(person.order) ? person.order : index);

export function buildOrgChart(officers) {
  const levels = LEVELS.map((tier) => ({ tier, groups: [], byKey: new Map() }));

  officers.forEach((officer, index) => {
    // An unknown tier value is drawn in the last level rather than dropped.
    const at = LEVELS.indexOf(officer.tier);
    const target = levels[at < 0 ? LEVELS.length - 1 : at];
    const label = (officer.groupName || '').trim();
    // Positions without a group stand alone; they are never merged by guesswork.
    const key = label ? label.toLowerCase() : `solo:${officer.id}`;
    const order = orderOf(officer, index);
    let group = target.byKey.get(key);
    if (!group) {
      group = { key: `${target.tier}:${key}`, label, order, people: [] };
      target.byKey.set(key, group);
      target.groups.push(group);
    }
    group.order = Math.min(group.order, order);
    group.people.push({ ...officer, order, deputy: Boolean(officer.isDeputy) });
  });

  return levels
    .map(({ tier, groups }) => ({
      tier,
      groups: groups
        .map((group) => ({
          ...group,
          people: [...group.people].sort((a, b) => Number(a.deputy) - Number(b.deputy) || a.order - b.order),
        }))
        .sort((a, b) => a.order - b.order),
    }))
    .filter((level) => level.groups.length);
}

/** Every officer id once, in the order the chart draws them. Saving this order keeps groups contiguous. */
export function chartSequence(officers) {
  return buildOrgChart(officers).flatMap((level) => level.groups.flatMap((group) => group.people.map((p) => p.id)));
}

/** Names of groups already in use, for suggestions in the editor. */
export function groupNames(officers) {
  const seen = new Map();
  officers.forEach((o) => {
    const label = (o.groupName || '').trim();
    if (label && !seen.has(label.toLowerCase())) seen.set(label.toLowerCase(), label);
  });
  return [...seen.values()];
}
