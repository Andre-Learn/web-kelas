import { Link } from 'react-router-dom';
import SectionHeading from '../SectionHeading.jsx';
import StructureChart from '../StructureChart.jsx';
import Icon from '../Icon.jsx';
import { useContent } from '../../context/ContentContext.jsx';

export default function StructureSection() {
  const { content } = useContent();
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
        <StructureChart officers={content.officers} limit={4} />
      </div>
    </section>
  );
}
