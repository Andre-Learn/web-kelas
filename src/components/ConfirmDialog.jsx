import { useId, useRef } from 'react';
import Dialog from './Dialog.jsx';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy = false, onConfirm, onCancel }) {
  const titleId = useId();
  const cancelRef = useRef(null);
  return (
    <Dialog open={open} onClose={busy ? () => {} : onCancel} labelledBy={titleId} className="dialog--confirm" initialFocusRef={cancelRef}>
      <div className="confirm">
        <h2 id={titleId} className="confirm__title">
          {title}
        </h2>
        <p id={`${titleId}-desc`} className="confirm__text">
          {message}
        </p>
        <div className="confirm__actions">
          <button ref={cancelRef} type="button" className="btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
