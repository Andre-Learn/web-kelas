import { useEffect, useRef, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import EditorDialog from '../../components/admin/EditorDialog.jsx';
import RowActions from '../../components/admin/RowActions.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Dialog, { DialogClose } from '../../components/Dialog.jsx';
import { TextInput } from '../../components/FormControls.jsx';
import Photo from '../../components/Photo.jsx';
import Icon from '../../components/Icon.jsx';
import { EmptyState } from '../../components/States.jsx';
import { formatDate } from '../../components/Lightbox.jsx';
import { useToast } from '../../components/Toast.jsx';
import useCollection from '../../hooks/useCollection.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { useContent } from '../../context/ContentContext.jsx';
import { saveItem, uploadImage } from '../../lib/api.js';
import { ACCEPTED_IMAGE_TYPES, validateImageFile, createId } from '../../lib/image.js';

const IMAGE_MAP = { src: 'src', thumb: 'thumb', path: 'path', width: 'width', height: 'height' };
const STATUS_TEXT = { ready: 'Ready', processing: 'Preparing…', uploading: 'Uploading…', saving: 'Saving…', done: 'Published', error: 'Failed' };

function MetaFields({ value, onChange, categories, idPrefix }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });
  return (
    <>
      <TextInput label="Caption" value={value.caption} onChange={set('caption')} optional />
      <TextInput
        label="Image description"
        value={value.alt}
        onChange={set('alt')}
        optional
        hint="What the photo shows, for screen-reader users. Falls back to the caption."
      />
      <div className="form__row">
        <TextInput label="Date" type="date" value={value.date} onChange={set('date')} optional />
        <TextInput label="Category" value={value.category} onChange={set('category')} optional list={`${idPrefix}-categories`} />
      </div>
      <datalist id={`${idPrefix}-categories`}>
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
}

function UploadQueue({ open, onClose, categories }) {
  const { content, update } = useContent();
  const toast = useToast();
  const [queue, setQueue] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [running, setRunning] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setQueue((q) => {
        q.forEach((item) => URL.revokeObjectURL(item.preview));
        return [];
      });
      setRejected([]);
    }
  }, [open]);

  const add = (files) => {
    const accepted = [];
    const problems = [];
    [...files].forEach((file) => {
      const problem = validateImageFile(file);
      if (problem) problems.push(problem);
      else accepted.push({ key: createId(), file, preview: URL.createObjectURL(file), status: 'ready', error: '', meta: { caption: '', alt: '', date: '', category: '' } });
    });
    setQueue((q) => [...q, ...accepted]);
    setRejected(problems);
    if (inputRef.current) inputRef.current.value = '';
  };

  const patch = (key, next) => setQueue((q) => q.map((item) => (item.key === key ? { ...item, ...next } : item)));

  const publish = async () => {
    setRunning(true);
    let order = content.gallery.length;
    let published = 0;
    for (const item of queue) {
      if (item.status === 'done') continue;
      try {
        const up = await uploadImage(item.file, 'gallery', (stage) => patch(item.key, { status: stage === 'done' ? 'saving' : stage, error: '' }));
        patch(item.key, { status: 'saving' });
        const record = { ...item.meta };
        for (const [from, to] of Object.entries(IMAGE_MAP)) record[to] = up[from];
        const saved = await saveItem('gallery', record, order++);
        update('gallery', (list) => [...list, saved]);
        patch(item.key, { status: 'done' });
        published += 1;
      } catch (err) {
        patch(item.key, { status: 'error', error: err.message });
      }
    }
    setRunning(false);
    if (published) toast.success(`${published} ${published === 1 ? 'photo' : 'photos'} published.`);
  };

  const pending = queue.filter((i) => i.status !== 'done');
  const failed = queue.filter((i) => i.status === 'error').length;
  const allDone = queue.length > 0 && pending.length === 0;

  return (
    <Dialog open={open} onClose={running ? () => {} : onClose} labelledBy="upload-title" className="dialog--editor dialog--wide">
      <div className="editor">
        <header className="editor__head">
          <h2 id="upload-title" className="editor__title">
            Upload photos
          </h2>
          <DialogClose onClick={onClose} />
        </header>
        <div className="editor__body">
          <div
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!running) add(e.dataTransfer.files);
            }}
          >
            <Icon name="upload" size={22} />
            <p>Drop photos here, or</p>
            <input
              ref={inputRef}
              id="gallery-files"
              type="file"
              multiple
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className="sr-only"
              onChange={(e) => add(e.target.files)}
              disabled={running}
            />
            <label htmlFor="gallery-files" className="btn btn--sm">
              Choose files
            </label>
            <p className="field__hint">JPG, PNG, or WebP up to 8 MB each. Check every photo before publishing.</p>
          </div>

          {rejected.length ? (
            <ul className="form__error-list" role="alert">
              {rejected.map((r) => (
                <li key={r}>
                  <Icon name="alert" size={14} />
                  {r}
                </li>
              ))}
            </ul>
          ) : null}

          {queue.length ? (
            <ul role="list" className="queue">
              {queue.map((item) => (
                <li key={item.key} className={`queue__item queue__item--${item.status}`}>
                  <img src={item.preview} alt="" className="queue__preview" />
                  <div className="queue__fields form">
                    <div className="queue__status">
                      <span className="queue__name">{item.file.name}</span>
                      <span className="queue__badge" role="status">
                        {STATUS_TEXT[item.status]}
                      </span>
                    </div>
                    {item.error ? <p className="field__error">{item.error}</p> : null}
                    {item.status === 'ready' || item.status === 'error' ? (
                      <>
                        <MetaFields value={item.meta} onChange={(meta) => patch(item.key, { meta })} categories={categories} idPrefix={item.key} />
                        <button
                          type="button"
                          className="btn btn--sm btn--ghost queue__remove"
                          onClick={() => {
                            URL.revokeObjectURL(item.preview);
                            setQueue((q) => q.filter((x) => x.key !== item.key));
                          }}
                          disabled={running}
                        >
                          <Icon name="trash" size={14} />
                          Remove from upload
                        </button>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <footer className="editor__foot">
          <p className="muted editor__note" aria-live="polite">
            {failed ? `${failed} failed — fix or remove, then publish again.` : allDone ? 'All photos published.' : queue.length ? `${pending.length} ready to publish` : ''}
          </p>
          <div className="editor__buttons">
            <button type="button" className="btn" onClick={onClose} disabled={running}>
              {allDone ? 'Done' : 'Cancel'}
            </button>
            {!allDone ? (
              <button type="button" className="btn btn--primary" onClick={publish} disabled={running || !pending.length}>
                {running ? 'Publishing…' : `Publish ${pending.length || ''}`.trim()}
              </button>
            ) : null}
          </div>
        </footer>
      </div>
    </Dialog>
  );
}

export default function GalleryManagerPage() {
  useDocumentTitle('Gallery settings');
  const { items, save, remove, move, stage, busy } = useCollection('gallery', { folder: 'gallery', imageMap: IMAGE_MAP, noun: 'Photo' });
  const [uploading, setUploading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];

  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Photos shown on the homepage (first six) and the Gallery page."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setUploading(true)}>
            <Icon name="upload" size={16} />
            Upload photos
          </button>
        }
      />

      {items.length ? (
        <ul role="list" className="manage-list admin-panel">
          {items.map((item, index) => (
            <li key={item.id} className="manage-row">
              <Photo src={item.thumb || item.src} alt="" ratio="1 / 1" className="manage-row__thumb manage-row__thumb--square" />
              <div className="manage-row__text">
                <p className="manage-row__title">{item.caption || <span className="muted">No caption</span>}</p>
                <p className="manage-row__meta">{[formatDate(item.date), item.category].filter(Boolean).join(' · ') || 'No date or category'}</p>
              </div>
              <RowActions
                label={item.caption || `photo ${index + 1}`}
                index={index}
                total={items.length}
                onMove={(step) => move(item, step)}
                onEdit={() => setDraft({ ...item })}
                onDelete={() => setPendingDelete(item)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No photos yet"
          action={
            <button type="button" className="btn btn--sm" onClick={() => setUploading(true)}>
              Upload the first photos
            </button>
          }
        >
          Use photos everyone in them is comfortable sharing.
        </EmptyState>
      )}

      <UploadQueue open={uploading} onClose={() => setUploading(false)} categories={categories} />

      <EditorDialog
        open={Boolean(draft)}
        title="Edit photo details"
        onClose={() => setDraft(null)}
        onSubmit={async () => {
          if (await save(draft)) setDraft(null);
        }}
        busy={busy}
        stage={stage}
      >
        {draft ? (
          <>
            <Photo src={draft.thumb || draft.src} alt="" ratio={draft.width && draft.height ? `${draft.width} / ${draft.height}` : '4 / 3'} className="editor__preview" />
            <MetaFields value={draft} onChange={setDraft} categories={categories} idPrefix="edit" />
          </>
        ) : null}
      </EditorDialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove this photo?"
        message="It will be removed from the gallery and deleted from storage. This cannot be undone."
        confirmLabel="Remove photo"
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
