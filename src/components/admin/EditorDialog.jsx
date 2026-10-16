import { useId } from 'react';
import Dialog, { DialogClose } from '../Dialog.jsx';
import { UploadStatus } from '../FormControls.jsx';

/** Side panel/dialog used by every add/edit form in the dashboard. */
export default function EditorDialog({ open, title, onClose, onSubmit, busy, stage, submitLabel = 'Save', children }) {
  const titleId = useId();
  return (
    <Dialog open={open} onClose={busy ? () => {} : onClose} labelledBy={titleId} className="dialog--editor">
      <form
        className="editor"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <header className="editor__head">
          <h2 id={titleId} className="editor__title">
            {title}
          </h2>
          <DialogClose onClick={onClose} />
        </header>
        <div className="editor__body form">{children}</div>
        <footer className="editor__foot">
          <UploadStatus stage={stage} />
          <div className="editor__buttons">
            <button type="button" className="btn" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? 'Saving…' : submitLabel}
            </button>
          </div>
        </footer>
      </form>
    </Dialog>
  );
}
