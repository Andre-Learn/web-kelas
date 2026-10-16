import { Link } from 'react-router-dom';
import SectionHeading from '../SectionHeading.jsx';
import GalleryGrid from '../GalleryGrid.jsx';
import Icon from '../Icon.jsx';
import { EmptyState, SkeletonGrid } from '../States.jsx';
import { useContent } from '../../context/ContentContext.jsx';

const PREVIEW_COUNT = 6;

export default function GallerySection() {
  const { content, status } = useContent();
  const images = content.gallery;

  return (
    <section className="section section--alt" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHeading
          id="gallery-title"
          eyebrow="Class gallery"
          title="Moments worth keeping"
          description="Lessons, projects, trips, and the ordinary days in between."
        />
        {status === 'loading' ? (
          <SkeletonGrid count={3} className="gallery-skeleton" ratio="4 / 3" />
        ) : images.length ? (
          <GalleryGrid images={images.slice(0, PREVIEW_COUNT)} />
        ) : (
          <EmptyState title="No photos yet">The first class memories will be shared here soon.</EmptyState>
        )}
        <div className="section__footer">
          <Link to="/gallery" className="btn">
            View Full Gallery
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
