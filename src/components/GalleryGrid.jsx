import { useState } from 'react';
import Photo from './Photo.jsx';
import Icon from './Icon.jsx';
import Lightbox from './Lightbox.jsx';
import { RevealGroup, RevealItem } from './Reveal.jsx';

function shapeOf(image) {
  if (!image.width || !image.height) return 'square';
  const r = image.width / image.height;
  if (r > 1.25) return 'landscape';
  if (r < 0.85) return 'portrait';
  return 'square';
}

/** Masonry-style columns that keep each photo's own aspect ratio. */
export default function GalleryGrid({ images }) {
  const [index, setIndex] = useState(null);

  return (
    <>
      <RevealGroup as="ul" role="list" className="gallery-grid">
        {images.map((image, i) => {
          const ratio = image.width && image.height ? `${image.width} / ${image.height}` : '1 / 1';
          return (
            <RevealItem as="li" key={image.id} className={`gallery-grid__item gallery-grid__item--${shapeOf(image)}`}>
              <button
                type="button"
                className="gallery-tile"
                onClick={() => setIndex(i)}
                aria-haspopup="dialog"
                aria-label={`Open photo: ${image.caption || image.alt || `photo ${i + 1}`}`}
              >
                <Photo
                  src={image.thumb || image.src}
                  alt={image.alt || image.caption || ''}
                  ratio={ratio}
                  width={image.width || undefined}
                  height={image.height || undefined}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="gallery-tile__photo"
                />
                {image.caption ? (
                  <span className="gallery-tile__caption" aria-hidden="true">
                    {image.caption}
                  </span>
                ) : null}
                <span className="gallery-tile__expand" aria-hidden="true">
                  <Icon name="expand" size={16} />
                </span>
              </button>
            </RevealItem>
          );
        })}
      </RevealGroup>
      <Lightbox images={images} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
    </>
  );
}
