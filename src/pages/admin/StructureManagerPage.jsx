import { useMemo, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import EditorDialog from '../../components/admin/EditorDialog.jsx';
import RowActions from '../../components/admin/RowActions.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { Checkbox, ImagePicker, Select, TextArea, TextInput } from '../../components/FormControls.jsx';
import Photo from '../../components/Photo.jsx';
import Icon from '../../components/Icon.jsx';
import StructureChart from '../../components/StructureChart.jsx';
import { EmptyState } from '../../components/States.jsx';
import useCollection from '../../hooks/useCollection.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { OFFICER_TIERS, STARTER_ROLES } from '../../data/defaultContent.js';
import { officerGroupsAvailable } from '../../lib/api.js';
import { buildOrgChart, groupNames } from '../../lib/orgChart.js';
import ContentGate from '../../components/admin/ContentGate.jsx';

const IMAGE_MAP = { src: 'photo', path: 'photoPath' };
const EMPTY = { name: '', role: '', tier: 'officer', groupName: '', isDeputy: false, description: '', photo: '' };
const tierLabel = Object.fromEntries(OFFICER_TIERS.map((t) => [t.id, t.label]));

export default function StructureManagerPage() {
  useDocumentTitle('Structure settings');
  const { items, save, addMany, remove, reorder, stage, busy, moving, ready } = useCollection('officers', {
    folder: 'officers',
    imageMap: IMAGE_MAP,
    noun: 'Position',
  });
  const [draft, setDraft] = useState(null);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const groupsSupported = officerGroupsAvailable();
  const levels = useMemo(() => buildOrgChart(items), [items]);
  const existingGroups = useMemo(() => groupNames(items), [items]);
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const open = (item) => {
    setDraft(item ? { ...EMPTY, ...item } : { ...EMPTY });
    setFile(null);
    setErrors({});
  };
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const submit = async () => {
    const next = {};
    if (!draft.role.trim()) next.role = 'Enter the position, for example “Secretary”.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const isNew = !draft.id;
    const ok = await save(
      { ...draft, name: draft.name.trim(), role: draft.role.trim(), groupName: draft.groupName.trim(), id: isNew ? undefined : draft.id },
      file,
    );
    if (ok) setDraft(null);
  };

  // Every reorder saves the full chart order, so groups stay contiguous and no record is touched except its position.
  const commit = (next) => reorder(next.flatMap((level) => level.groups.flatMap((group) => group.people.map((p) => byId.get(p.id)))));

  const moveGroup = (levelIndex, groupIndex, step) => {
    const next = levels.map((level) => ({ ...level, groups: [...level.groups] }));
    const groups = next[levelIndex].groups;
    [groups[groupIndex], groups[groupIndex + step]] = [groups[groupIndex + step], groups[groupIndex]];
    commit(next);
  };

  // Primary positions and deputies keep their own order: a deputy always follows the primary positions of its group.
  const movePerson = (levelIndex, groupIndex, person, step) => {
    const next = levels.map((level) => ({ ...level, groups: [...level.groups] }));
    const group = { ...next[levelIndex].groups[groupIndex], people: [...next[levelIndex].groups[groupIndex].people] };
    const same = group.people.map((p, i) => (p.deputy === person.deputy ? i : -1)).filter((i) => i >= 0);
    const at = same.findIndex((i) => group.people[i].id === person.id);
    const to = same[at + step];
    if (to === undefined) return;
    [group.people[same[at]], group.people[to]] = [group.people[to], group.people[same[at]]];
    next[levelIndex].groups[groupIndex] = group;
    commit(next);
  };

  return (
    <>
      <AdminPageHeader
        title="Structure"
        description="Positions in the class organisation chart. Add a position, put it in a level and a group, and it appears on the website. Leave a name empty to show “Not yet announced”."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => open(null)} disabled={!ready}>
            <Icon name="plus" size={16} />
            Add position
          </button>
        }
      />

      <ContentGate what="class structure">
        {!groupsSupported ? (
          <p className="admin-note" role="status">
            Groups and deputies are switched off because the database has not received the officer-groups migration yet
            (supabase/migrations/2026-10-19-officer-groups.sql). The chart still works; every position is drawn on its own.
          </p>
        ) : null}

        {items.length ? (
          <>
            <div className="structure-admin">
              {levels.map((level, levelIndex) => (
                <section key={level.tier} className="structure-admin__level" aria-labelledby={`level-${level.tier}`}>
                  <h2 id={`level-${level.tier}`} className="structure-admin__level-title mono">
                    {tierLabel[level.tier]}
                  </h2>
                  {level.groups.map((group, groupIndex) => (
                    <div key={group.key} className="structure-admin__group admin-panel">
                      {group.label || level.groups.length > 1 ? (
                        <div className="structure-admin__group-head">
                          <p className="structure-admin__group-name">{group.label || 'Not grouped'}</p>
                          {level.groups.length > 1 ? (
                            <div className="row-actions">
                              <button
                                type="button"
                                className="btn btn--icon btn--sm btn--ghost"
                                onClick={() => moveGroup(levelIndex, groupIndex, -1)}
                                disabled={moving || groupIndex === 0}
                                aria-label={`Move group ${group.label || group.people[0].role} up`}
                              >
                                <Icon name="arrowUp" size={16} />
                              </button>
                              <button
                                type="button"
                                className="btn btn--icon btn--sm btn--ghost"
                                onClick={() => moveGroup(levelIndex, groupIndex, 1)}
                                disabled={moving || groupIndex === level.groups.length - 1}
                                aria-label={`Move group ${group.label || group.people[0].role} down`}
                              >
                                <Icon name="arrowDown" size={16} />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      <ul role="list" className="manage-list">
                        {group.people.map((person) => {
                          const same = group.people.filter((p) => p.deputy === person.deputy);
                          const item = byId.get(person.id);
                          return (
                            <li key={person.id} className="manage-row">
                              <Photo src={item.photo} name={item.name} fallback="person" ratio="1 / 1" className="manage-row__thumb" />
                              <div className="manage-row__text">
                                <p className="manage-row__title">{item.name || <span className="muted">No name yet</span>}</p>
                                <p className="manage-row__meta">
                                  {item.role}
                                  {item.isDeputy ? ' · Deputy' : ''}
                                </p>
                              </div>
                              <RowActions
                                label={item.role}
                                index={same.findIndex((p) => p.id === person.id)}
                                total={same.length}
                                onMove={(step) => movePerson(levelIndex, groupIndex, person, step)}
                                disabled={moving}
                                onEdit={() => open(item)}
                                onDelete={() => setPendingDelete(item)}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </section>
              ))}
            </div>

            <details className="structure-admin__preview">
              <summary>Preview the chart</summary>
              <StructureChart officers={items} />
            </details>
          </>
        ) : (
          <EmptyState
            icon="structure"
            title="No positions published yet"
            action={
              <div className="state__buttons">
                <button
                  type="button"
                  className="btn btn--sm btn--primary"
                  disabled={busy}
                  onClick={() => addMany(STARTER_ROLES, 'Standard positions added. Fill in the names when they are confirmed.')}
                >
                  {busy ? 'Adding…' : 'Add standard positions'}
                </button>
                <button type="button" className="btn btn--sm" onClick={() => open(null)}>
                  Add one position
                </button>
              </div>
            }
          >
            The standard positions are Wali Kelas, Ketua and Wakil Ketua Kelas, Sekretaris and Wakil Sekretaris, Bendahara and Wakil
            Bendahara. They are saved with empty names and shown as “Not yet announced”.
          </EmptyState>
        )}
      </ContentGate>

      <EditorDialog
        open={Boolean(draft)}
        title={draft?.id ? `Edit ${draft.role || 'position'}` : 'Add position'}
        onClose={() => setDraft(null)}
        onSubmit={submit}
        busy={busy}
        stage={stage}
      >
        {draft ? (
          <>
            <ImagePicker
              label="Profile photo"
              ratio="1 / 1"
              currentSrc={draft.photo}
              file={file}
              onFileChange={setFile}
              onRemove={() => setDraft((d) => ({ ...d, photo: '', photoPath: '' }))}
            />
            <TextInput label="Full name" value={draft.name} onChange={set('name')} optional autoComplete="off" />
            <TextInput label="Position" value={draft.role} onChange={set('role')} error={errors.role} />
            <Select
              label="Level"
              value={draft.tier}
              onChange={set('tier')}
              options={OFFICER_TIERS.map((t) => ({ value: t.id, label: t.label }))}
              hint="Controls which row of the chart this position appears in."
            />
            <TextInput
              label="Group"
              value={draft.groupName}
              onChange={set('groupName')}
              optional
              list="officer-groups"
              maxLength={60}
              autoComplete="off"
              disabled={!groupsSupported}
              hint="Positions with the same group name in the same level are framed together, for example “Secretary”."
            />
            <datalist id="officer-groups">
              {existingGroups.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <Checkbox
              label="This is a deputy"
              checked={Boolean(draft.isDeputy)}
              onChange={(e) => setDraft((d) => ({ ...d, isDeputy: e.target.checked }))}
              disabled={!groupsSupported}
              hint="A deputy is drawn next to the primary position in the same group."
            />
            <TextArea label="Short description" value={draft.description} onChange={set('description')} optional rows={3} />
          </>
        ) : null}
      </EditorDialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Remove ${pendingDelete?.role ?? ''}?`}
        message="This removes the position and its photo from the website. Other positions are not changed. This cannot be undone."
        confirmLabel="Remove"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          setDeleting(true);
          await remove(pendingDelete);
          setDeleting(false);
          setPendingDelete(null);
        }}
      />
    </>
  );
}
