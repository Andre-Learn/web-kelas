import { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { validateImageFile, ACCEPTED_IMAGE_TYPES } from '../lib/image.js';

export function Field({ label, hint, error, children, id, optional }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label htmlFor={fieldId} className="field__label">
        {label}
        {optional ? <span className="field__optional">Optional</span> : null}
      </label>
      {children({ id: fieldId, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint ? (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="field__error">
          <Icon name="alert" size={14} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({ label, hint, error, optional, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional}>
      {(a11y) => <input className="input" {...a11y} {...props} />}
    </Field>
  );
}

export function TextArea({ label, hint, error, optional, rows = 4, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} optional={optional}>
      {(a11y) => <textarea className="input input--area" rows={rows} {...a11y} {...props} />}
    </Field>
  );
}

export function Select({ label, hint, error, options, ...props }) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(a11y) => (
        <div className="select">
          <select className="input" {...a11y} {...props}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" size={16} className="select__icon" />
        </div>
      )}
    </Field>
  );
}

/**
 * Picks one image, validates it, and shows a local preview.
 * Nothing is uploaded here; the parent decides when to upload.
 */
export function ImagePicker({ label, currentSrc, file, onFileChange, hint, ratio = '16 / 9', onRemove, actions, badge }) {
  const id = useId();
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const choose = (picked) => {
    if (!picked) return;
    const problem = validateImageFile(picked);
    setError(problem || '');
    onFileChange(problem ? null : picked);
    if (inputRef.current) inputRef.current.value = '';
  };

  const shown = preview || currentSrc;

  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <span className="field__label" id={`${id}-label`}>
        {label}
      </span>
      <div
        className={`picker ${dragging ? 'picker--drag' : ''}`}
        style={{ '--picker-ratio': ratio }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          choose(e.dataTransfer.files?.[0]);
        }}
      >
        {shown ? (
          <img src={shown} alt="" className="picker__preview" />
        ) : (
          <div className="picker__empty">
            <Icon name="upload" size={22} />
            <span>Drop an image here or choose a file</span>
          </div>
        )}
        {preview || badge ? <span className="picker__badge">{preview ? 'New, not saved yet' : badge}</span> : null}
      </div>
      <div className="picker__actions">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="sr-only"
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
          onChange={(e) => choose(e.target.files?.[0])}
        />
        <label htmlFor={id} className="btn btn--sm">
          <Icon name="upload" size={16} />
          {shown ? 'Replace image' : 'Upload image'}
        </label>
        {actions}
        {file ? (
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => onFileChange(null)}>
            Undo
          </button>
        ) : null}
        {!file && currentSrc && onRemove ? (
          <button type="button" className="btn btn--sm btn--ghost" onClick={onRemove}>
            Remove image
          </button>
        ) : null}
      </div>
      <p id={`${id}-hint`} className="field__hint">
        {hint || 'JPG, PNG, or WebP up to 8 MB. Images are resized before upload.'}
      </p>
      {error ? (
        <p id={`${id}-error`} className="field__error" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

const STAGE_LABEL = { processing: 'Preparing image…', uploading: 'Uploading…', saving: 'Saving…', done: 'Done' };

export function UploadStatus({ stage }) {
  if (!stage) return null;
  const steps = ['processing', 'uploading', 'saving'];
  const at = stage === 'done' ? steps.length : steps.indexOf(stage);
  return (
    <div className="upload-status" role="status" aria-live="polite">
      <div className="upload-status__bar">
        <span style={{ width: `${((at + (stage === 'done' ? 0 : 0.5)) / steps.length) * 100}%` }} />
      </div>
      <span>{STAGE_LABEL[stage]}</span>
    </div>
  );
}
