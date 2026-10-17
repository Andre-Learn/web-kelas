import { Link } from 'react-router-dom';
import SectionHeading from '../SectionHeading.jsx';
import StructureChart from '../StructureChart.jsx';
import Icon from '../Icon.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import { EmptyState, SkeletonGrid } from '../States.jsx';

export default function StructureSection() {
  const { content, status } = useContent();
  return (
    <section className="section section--alt" aria-labelledby="structure-title">
      <div className="container">
        <SectionHeading
          id="structure-title"
          eyebrow="Class structure"
          title="The people who keep us organised"
          description="Our homeroom teacher and class officers, from the top of the structure down."
          action={
            <Link to="/structure" className="text-link">
              Full structure
              <Icon name="arrowRight" size={16} />
            </Link>
          }
        />
        {status === 'loading' ? (
          <SkeletonGrid count={3} className="structure-skeleton" ratio="3 / 1" />
        ) : content.officers.length ? (
          <StructureChart officers={content.officers} limit={4} moreHref="/structure" />
        ) : (
          <EmptyState icon="structure" title="The class structure has not been published yet" />
        )}
      </div>
    </section>
  );
}
