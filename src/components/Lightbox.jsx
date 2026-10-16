import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import Dialog from './Dialog.jsx';
import Icon from './Icon.jsx';
import Photo from './Photo.jsx';

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Lightbox({ images, index, onClose, onIndexChange }) {
  const open = index !== null && index >= 0;
  const image = open ? images[index] : null;
  const [direction, setDirection] = useState(0);
  const touch = useRef(null);
  const closeRef = useRef(null);
  const count = images.length;

  const go = useCallback(
    (step) => {
      if (!open || count < 2) return;
      setDirection(step);
      onIndexChange((index + step + count) % count);
    },
    [open, count, index, onIndexChange],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, go]);

  // Warm the neighbours so next/previous feels instant.
  useEffect(() => {
    if (!open || count < 2) return;
    [1, -1].forEach((step) => {
      const next = images[(index + step + count) % count];
      if (next?.src) new Image().src = next.src;
    });
  }, [open, index, images, count]);

  const onTouchStart = (e) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  const date = image ? formatDate(image.date) : '';

  return (
    <Dialog open={open} onClose={onClose} labelledBy="lightbox-title" className="dialog--lightbox" initialFocusRef={closeRef}>
      {image ? (
        <div className="lightbox" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="lightbox__bar">
            <p className="lightbox__count" aria-live="polite">
              {index + 1} / {count}
            </p>
            <button ref={closeRef} type="button" className="lightbox__btn" onClick={onClose} aria-label="Close gallery viewer">
              <Icon name="close" size={22} />
            </button>
          </div>

          <div className="lightbox__stage">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <m.div
                key={image.id}
                className="lightbox__frame"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Photo
                  src={image.src}
                  alt={image.alt || image.caption || 'Class photo'}
                  width={image.width || undefined}
                  height={image.height || undefined}
                  loading="eager"
                  className="lightbox__photo"
                />
              </m.div>
            </AnimatePresence>

            {count > 1 ? (
              <>
                <button type="button" className="lightbox__btn lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
                  <Icon name="chevronLeft" size={24} />
                </button>
                <button type="button" className="lightbox__btn lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Next photo">
                  <Icon name="chevronRight" size={24} />
                </button>
              </>
            ) : null}
          </div>

          <div className="lightbox__caption">
            <h2 id="lightbox-title" className="lightbox__title">
              {image.caption || 'Untitled photo'}
            </h2>
            {date ? (
              <p className="lightbox__date">
                <Icon name="calendar" size={14} />
                <time dateTime={image.date}>{date}</time>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
