import { useMemo, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import EditorDialog from '../../components/admin/EditorDialog.jsx';
import RowActions from '../../components/admin/RowActions.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { ImagePicker, TextArea, TextInput } from '../../components/FormControls.jsx';
import Photo from '../../components/Photo.jsx';
import Icon from '../../components/Icon.jsx';
import { EmptyState } from '../../components/States.jsx';
import useCollection from '../../hooks/useCollection.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import ContentGate from '../../components/admin/ContentGate.jsx';

const IMAGE_MAP = { src: 'photo', thumb: 'photoThumb', path: 'photoPath' };
const EMPTY = { name: '', number: '', intro: '', photo: '', photoThumb: '' };

export default function MembersManagerPage() {
  useDocumentTitle('Member settings');
  const { items, save, remove, move, stage, busy, moving, ready } = useCollection('members', { folder: 'members', imageMap: IMAGE_MAP, noun: 'Member' });
  const [draft, setDraft] = useState(null);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState('');

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? items.filter((m) => m.name.toLowerCase().includes(q)) : items;
  }, [items, filter]);

  const open = (item) => {
    setDraft(item ? { ...item, number: item.number ?? '' } : { ...EMPTY });
    setFile(null);
    setErrors({});
  };
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const submit = async () => {
    const next = {};
    if (!draft.name.trim()) next.name = 'Enter the student’s name.';
    const num = String(draft.number).trim();
    if (num && !/^\d{1,3}$/.test(num)) next.number = 'Use a whole number, for example 7.';
    else if (num && items.some((m) => String(m.number) === String(Number(num)) && m.id !== draft.id)) next.number = `Number ${num} is already used.`;
    setErrors(next);
    if (Object.keys(next).length) return;
    const ok = await save({ ...draft, name: draft.name.trim(), number: num ? Number(num) : '' }, file);
    if (ok) setDraft(null);
  };

  return (
    <>
      <AdminPageHeader
        title="Members"
        description="Students shown on the homepage and the Members page. Publish photos only with the student’s permission."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => open(null)}>
            <Icon name="plus" size={16} />
            Add member
          </button>
        }
      />

      <ContentGate what="members">
      {items.length ? (
        <section className="admin-panel">
          <div className="manage-toolbar">
            <label className="sr-only" htmlFor="member-filter">
              Filter members
            </label>
            <input id="member-filter" type="search" className="input" placeholder="Filter by name" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <p className="muted manage-toolbar__count">
              {shown.length} of {items.length}
            </p>
          </div>
          {shown.length ? (
            <ul role="list" className="manage-list">
              {shown.map((item) => {
                const index = items.indexOf(item);
                return (
                  <li key={item.id} className="manage-row">
                    <Photo src={item.photoThumb || item.photo} name={item.name} fallback="person" ratio="1 / 1" className="manage-row__thumb" />
                    <div className="manage-row__text">
                      <p className="manage-row__title">{item.name}</p>
                      <p className="manage-row__meta">
                        {item.number ? `No. ${item.number}` : 'No number'}
                        {item.photo ? '' : ' · No photo'}
                      </p>
                    </div>
                    <RowActions
                      label={item.name}
                      index={index}
                      total={items.length}
                      canMove={!filter}
                      onMove={(step) => move(item, step)}
                      disabled={moving}
                      onEdit={() => open(item)}
                      onDelete={() => setPendingDelete(item)}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted manage-empty">No members match “{filter}”.</p>
          )}
        </section>
      ) : (
        <EmptyState
          icon="users"
          title="No members yet"
          action={
            <button type="button" className="btn btn--sm" onClick={() => open(null)}>
              Add the first member
            </button>
          }
        >
          Add students one at a time. You can set their order afterwards.
        </EmptyState>
      )}
      </ContentGate>

      <EditorDialog open={Boolean(draft)} title={draft?.id ? `Edit ${draft.name}` : 'Add member'} onClose={() => setDraft(null)} onSubmit={submit} busy={busy} stage={stage}>
        {draft ? (
          <>
            <ImagePicker
              label="Photo"
              ratio="4 / 5"
              currentSrc={draft.photoThumb || draft.photo}
              file={file}
              onFileChange={setFile}
              onRemove={() => setDraft((d) => ({ ...d, photo: '', photoThumb: '', photoPath: '' }))}
            />
            <TextInput label="Full name" value={draft.name} onChange={set('name')} error={errors.name} autoComplete="off" />
            <TextInput label="Class number" value={draft.number} onChange={set('number')} error={errors.number} optional inputMode="numeric" />
            <TextArea
              label="Short introduction"
              value={draft.intro}
              onChange={set('intro')}
              optional
              rows={3}
              hint="Shown when a visitor opens the profile. Avoid phone numbers, addresses, and other private details."
            />
          </>
        ) : null}
      </EditorDialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Remove ${pendingDelete?.name ?? ''}?`}
        message="Their profile and photo will be removed from the website. This cannot be undone."
        confirmLabel="Remove member"
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
