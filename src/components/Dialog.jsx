import { forwardRef, useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

/**
 * Accessible modal built on the native <dialog>: focus is contained, Escape closes,
 * and the rest of the page becomes inert while it is open.
 */
export default function Dialog({ open, onClose, labelledBy, className = '', children, initialFocusRef }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add('is-locked');
      initialFocusRef?.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
    if (!open) document.documentElement.classList.remove('is-locked');
  }, [open, initialFocusRef]);

  useEffect(() => () => document.documentElement.classList.remove('is-locked'), []);

  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open ? children : null}
    </dialog>
  );
}

export const DialogClose = forwardRef(function DialogClose({ onClick, label = 'Close', className = '' }, ref) {
  return (
    <button ref={ref} type="button" className={`dialog__close ${className}`} onClick={onClick} aria-label={label}>
      <Icon name="close" size={20} />
    </button>
  );
});
