import { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import EditorDialog from '../../components/admin/EditorDialog.jsx';
import RowActions from '../../components/admin/RowActions.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { ImagePicker, Select, TextArea, TextInput } from '../../components/FormControls.jsx';
import Photo from '../../components/Photo.jsx';
import Icon from '../../components/Icon.jsx';
import { EmptyState } from '../../components/States.jsx';
import useCollection from '../../hooks/useCollection.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { OFFICER_TIERS } from '../../data/defaultContent.js';

const IMAGE_MAP = { src: 'photo', path: 'photoPath' };
const EMPTY = { name: '', role: '', tier: 'officer', description: '', photo: '' };
const tierLabel = Object.fromEntries(OFFICER_TIERS.map((t) => [t.id, t.label]));

export default function StructureManagerPage() {
  useDocumentTitle('Structure settings');
  const { items, save, remove, move, stage, busy } = useCollection('officers', { folder: 'officers', imageMap: IMAGE_MAP, noun: 'Officer' });
  const [draft, setDraft] = useState(null);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const open = (item) => {
    setDraft(item ? { ...item } : { ...EMPTY });
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
    const ok = await save({ ...draft, name: draft.name.trim(), role: draft.role.trim(), id: isNew ? undefined : draft.id }, file);
    if (ok) setDraft(null);
  };

  return (
    <>
      <AdminPageHeader
        title="Structure"
        description="Homeroom teacher and class officers. Leave a name empty to show the role as “Not yet announced”."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => open(null)}>
            <Icon name="plus" size={16} />
            Add officer
          </button>
        }
      />

      {items.length ? (
        <ul role="list" className="manage-list admin-panel">
          {items.map((item, index) => (
            <li key={item.id} className="manage-row">
              <Photo src={item.photo} name={item.name} fallback="person" ratio="1 / 1" className="manage-row__thumb" />
              <div className="manage-row__text">
                <p className="manage-row__title">{item.name || <span className="muted">No name yet</span>}</p>
                <p className="manage-row__meta">
                  {item.role} · {tierLabel[item.tier]}
                </p>
              </div>
              <RowActions
                label={item.role}
                index={index}
                total={items.length}
                onMove={(step) => move(item, step)}
                onEdit={() => open(item)}
                onDelete={() => setPendingDelete(item)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon="structure" title="No officers yet" action={<button type="button" className="btn btn--sm" onClick={() => open(null)}>Add officer</button>} />
      )}

      <EditorDialog
        open={Boolean(draft)}
        title={draft?.id ? `Edit ${draft.role || 'officer'}` : 'Add officer'}
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
              hint="Controls which row of the structure this person appears in."
            />
            <TextArea label="Short description" value={draft.description} onChange={set('description')} optional rows={3} />
          </>
        ) : null}
      </EditorDialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Remove ${pendingDelete?.role ?? ''}?`}
        message="This removes the role and its photo from the website. This cannot be undone."
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
