import { useState } from 'react';
import Photo from './Photo.jsx';
import Icon from './Icon.jsx';
import Lightbox from './Lightbox.jsx';
import { RevealGroup, RevealItem } from './Reveal.jsx';
import { THUMB_SIZE } from '../lib/api.js';

// Only real renditions: the stored thumbnail and the full upload, with widths derived from the stored size.
function srcSetOf(image) {
  if (!image.thumb || !image.src || image.thumb === image.src || !image.width || !image.height) return undefined;
  const thumbW = Math.round(image.width * Math.min(1, THUMB_SIZE / Math.max(image.width, image.height)));
  if (thumbW >= image.width) return undefined;
  return `${image.thumb} ${thumbW}w, ${image.src} ${image.width}w`;
}

function shapeOf(image) {
  if (!image.width || !image.height) return 'square';
  const r = image.width / image.height;
  if (r > 1.25) return 'landscape';
  if (r < 0.85) return 'portrait';
  return 'square';
}

const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '');

/**
 * layout="masonry": columns that keep each photo's own aspect ratio (gallery page).
 * layout="bento": one large featured photo and up to four small ones, cropped to fixed shapes (homepage).
 * Captions sit under each photo so they are readable without hovering.
 */
export default function GalleryGrid({ images, layout = 'masonry' }) {
  const [index, setIndex] = useState(null);
  const bento = layout === 'bento';

  const sizesOf = (i) => {
    if (!bento) return '(min-width: 1024px) 33vw, (min-width: 560px) 50vw, 100vw';
    return i === 0 ? '(min-width: 900px) 50vw, 100vw' : '(min-width: 900px) 25vw, 50vw';
  };

  return (
    <>
      <RevealGroup as="ul" role="list" className={bento ? 'gallery-bento' : 'gallery-grid'}>
        {images.map((image, i) => {
          const ratio = image.width && image.height ? `${image.width} / ${image.height}` : '1 / 1';
          const itemClass = bento
            ? `gallery-bento__item ${i === 0 ? 'gallery-bento__item--featured' : ''}`
            : `gallery-grid__item gallery-grid__item--${shapeOf(image)}`;
          return (
            <RevealItem as="li" key={image.id} className={itemClass}>
              <button
                type="button"
                className="gallery-tile"
                onClick={() => setIndex(i)}
                aria-haspopup="dialog"
                aria-label={`Open photo: ${image.caption || image.alt || `photo ${i + 1}`}`}
              >
                <Photo
                  src={image.thumb || image.src}
                  srcSet={srcSetOf(image)}
                  alt={image.alt || image.caption || ''}
                  ratio={bento ? undefined : ratio}
                  width={image.width || undefined}
                  height={image.height || undefined}
                  sizes={sizesOf(i)}
                  className="gallery-tile__photo"
                />
                <span className="gallery-tile__expand" aria-hidden="true">
                  <Icon name="expand" size={16} />
                </span>
              </button>
              {image.caption || isDate(image.date) ? (
                <p className="gallery-caption">
                  {image.caption ? <span className="gallery-caption__text">{image.caption}</span> : null}
                  {isDate(image.date) ? (
                    <time className="gallery-caption__date mono" dateTime={image.date}>
                      {image.date}
                    </time>
                  ) : null}
                </p>
              ) : null}
            </RevealItem>
          );
        })}
      </RevealGroup>
      <Lightbox images={images} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
    </>
  );
}
