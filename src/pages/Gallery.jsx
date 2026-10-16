import { useEffect, useRef, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import { EmptyState } from '../components/States'
import { GALLERY } from '../data/placeholders'
import { thumbSrc, originalSrc } from '../lib/images'

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (lightbox === null) return
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') setLightbox(null)
      if (event.key === 'ArrowRight') setLightbox((index) => Math.min(index + 1, GALLERY.length - 1))
      if (event.key === 'ArrowLeft') setLightbox((index) => Math.max(index - 1, 0))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox !== null])

  return (
    <section className="section page-section">
      <div className="container">
        <SectionHeading kicker="Galeri" title="Kumpulan memori" id="galeri-title" />
        <div className="gallery-grid">
          {GALLERY.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`gallery-item ${item.ratio}`}
              onClick={() => setLightbox(index)}
            >
              <img
                src={thumbSrc(item.id)}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                width={item.ratio === 'portrait' ? 600 : 800}
                height={item.ratio === 'portrait' ? 800 : 560}
              />
            </button>
          ))}
        </div>
      </div>

      {lightbox !== null && GALLERY[lightbox] && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={GALLERY[lightbox].alt}>
          <button ref={closeRef} type="button" className="lightbox-close" onClick={() => setLightbox(null)}>Tutup</button>
          <img src={originalSrc(GALLERY[lightbox].id)} alt={GALLERY[lightbox].alt} />
          {GALLERY[lightbox].caption && <p>{GALLERY[lightbox].caption}</p>}
        </div>
      )}
    </section>
  )
}
