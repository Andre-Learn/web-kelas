import { Link } from 'react-router-dom';
import SectionHeading from '../SectionHeading.jsx';
import GalleryGrid from '../GalleryGrid.jsx';
import Icon from '../Icon.jsx';
import { EmptyState } from '../States.jsx';
import { useContent } from '../../context/ContentContext.jsx';

const PREVIEW_COUNT = 5;

// The one dark band on the homepage (redesign.txt 3.9). data-theme switches every token inside it.
export default function GallerySection() {
  const { content, status } = useContent();
  const images = content.gallery;

  return (
    <section className="section section--dark" data-theme="dark" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHeading
          id="gallery-title"
          index="04"
          eyebrow="Gallery"
          title="Moments worth keeping"
          description="Lessons, projects, trips, and the ordinary days in between."
          action={
            images.length ? (
              <Link to="/gallery" className="text-link">
                Full gallery
                <Icon name="arrowRight" size={16} />
              </Link>
            ) : null
          }
        />
        {status === 'loading' ? (
          <div className="gallery-bento" aria-hidden="true">
            {Array.from({ length: PREVIEW_COUNT }, (_, i) => (
              <div key={i} className={`gallery-bento__item ${i === 0 ? 'gallery-bento__item--featured' : ''}`}>
                <div className="skeleton gallery-bento__skeleton" />
              </div>
            ))}
          </div>
        ) : images.length ? (
          <GalleryGrid layout="bento" images={images.slice(0, PREVIEW_COUNT)} />
        ) : (
          <EmptyState title="No photos yet">The first class memories will be shared here soon.</EmptyState>
        )}
      </div>
    </section>
  );
}
