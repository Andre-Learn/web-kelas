import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import GalleryGrid from '../components/GalleryGrid.jsx';
import { EmptyState, SkeletonGrid } from '../components/States.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useContent } from '../context/ContentContext.jsx';

const ALL = '__all';

export default function GalleryPage() {
  useDocumentTitle('Gallery');
  const { content, status } = useContent();
  const [category, setCategory] = useState(ALL);
  const images = content.gallery;

  const categories = useMemo(
    () => [...new Set(images.map((i) => i.category?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [images],
  );
  const shown = category === ALL ? images : images.filter((i) => i.category?.trim() === category);

  return (
    <>
      <PageHeader
        eyebrow="Memories"
        title="Class Gallery"
        description="Photos from our time together. Select any photo to view it larger."
      >
        {categories.length ? (
          <div className="filters" role="group" aria-label="Filter photos by category">
            {[ALL, ...categories].map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c === ALL ? 'All' : c}
              </button>
            ))}
          </div>
        ) : null}
      </PageHeader>

      <section className="section section--tight" aria-label="Photos">
        <div className="container">
          {status === 'loading' ? (
            <SkeletonGrid count={6} className="gallery-skeleton" ratio="4 / 3" />
          ) : shown.length ? (
            <GalleryGrid key={category} images={shown} />
          ) : (
            <EmptyState title={images.length ? 'No photos in this category' : 'No photos yet'}>
              {images.length ? 'Choose another category to keep browsing.' : 'The first class memories will be shared here soon.'}
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
