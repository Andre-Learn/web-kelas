import { useId, useRef, useState } from 'react';
import Dialog, { DialogClose } from '../Dialog.jsx';
import Photo from '../Photo.jsx';
import { ImagePicker } from '../FormControls.jsx';
import { EmptyState } from '../States.jsx';
import { useContent } from '../../context/ContentContext.jsx';

/**
 * Hero photo field shared by Hero settings and Appearance.
 * The administrator can upload a new file or reuse a photo that is already in the media
 * library (the gallery). Choosing an existing photo stores its URLs; nothing is copied.
 *
 * value: { file, chosen, removed }, where chosen is { src, thumb, label } or null.
 */
export default function HeroImageField({ value, onChange, hint, allowRemove = true }) {
  const { content } = useContent();
  const { heroImage } = content.settings;
  const [browsing, setBrowsing] = useState(false);
  const titleId = useId();
  const closeRef = useRef(null);
  const library = content.gallery.filter((g) => g.src);

  const current = value.removed ? '' : value.chosen?.src || heroImage;
  const choose = (image) => {
    onChange({ file: null, removed: false, chosen: { src: image.src, thumb: image.thumb || '', label: image.caption || 'Gallery photo' } });
    setBrowsing(false);
  };

  return (
    <>
      <ImagePicker
        label="Hero photograph"
        currentSrc={current}
        file={value.file}
        badge={value.chosen && !value.file ? 'From gallery, not saved yet' : undefined}
        onFileChange={(file) => onChange({ file, chosen: null, removed: false })}
        onRemove={allowRemove && !value.chosen ? () => onChange({ file: null, chosen: null, removed: true }) : undefined}
        hint={hint}
        actions={
          <>
            <button type="button" className="btn btn--sm" onClick={() => setBrowsing(true)} aria-haspopup="dialog">
              Choose from gallery
            </button>
            {value.chosen || value.removed ? (
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => onChange({ file: null, chosen: null, removed: false })}>
                Undo
              </button>
            ) : null}
          </>
        }
      />

      <Dialog open={browsing} onClose={() => setBrowsing(false)} labelledBy={titleId} className="dialog--editor dialog--wide" initialFocusRef={closeRef}>
        <div className="editor">
          <header className="editor__head">
            <h2 id={titleId} className="editor__title">
              Choose a hero photo
            </h2>
            <DialogClose ref={closeRef} onClick={() => setBrowsing(false)} />
          </header>
          <div className="editor__body">
            {library.length ? (
              <>
                <p className="field__hint media-library__hint">Wide landscape photos work best. Portrait photos are cropped heavily on large screens.</p>
                <ul role="list" className="media-library">
                  {library.map((image) => {
                    const selected = current && image.src === current;
                    const wide = image.width && image.height ? image.width / image.height >= 1.25 : null;
                    return (
                      <li key={image.id}>
                        <button
                          type="button"
                          className="media-library__item"
                          aria-pressed={Boolean(selected)}
                          onClick={() => choose(image)}
                        >
                          <Photo src={image.thumb || image.src} alt="" ratio="16 / 10" className="media-library__photo" />
                          <span className="media-library__caption">
                            {image.caption || image.alt || 'Untitled photo'}
                            {wide === false ? <span className="media-library__note">Not landscape</span> : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <EmptyState title="The gallery is empty">Upload photos in Gallery settings first, or upload a hero photo directly.</EmptyState>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}

/** Settings patch for a HeroImageField value. Returns the upload options for useSettingsForm too. */
export function heroImagePatch(value) {
  if (value.chosen) return { patch: { heroImage: value.chosen.src, heroImageThumb: value.chosen.thumb }, upload: {} };
  if (value.file) return { patch: {}, upload: { file: value.file, imageKey: 'heroImage', thumbKey: 'heroImageThumb', folder: 'hero' } };
  if (value.removed) return { patch: { heroImage: '', heroImageThumb: '' }, upload: {} };
  return { patch: {}, upload: {} };
}

export const EMPTY_HERO_IMAGE = { file: null, chosen: null, removed: false };
