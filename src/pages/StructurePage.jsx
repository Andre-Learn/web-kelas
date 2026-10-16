import PageHeader from '../components/PageHeader.jsx';
import StructureChart from '../components/StructureChart.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useContent } from '../context/ContentContext.jsx';
import { EmptyState } from '../components/States.jsx';

export default function StructurePage() {
  useDocumentTitle('Structure');
  const { content } = useContent();
  return (
    <>
      <PageHeader
        eyebrow="Organisation"
        title="Class Structure"
        description="How XI TJKT-1 is organised: our homeroom teacher, the class leadership, and the officers who look after the details."
      />
      <section className="section section--tight" aria-label="Class organisation">
        <div className="container">
          {content.officers.length ? (
            <StructureChart officers={content.officers} />
          ) : (
            <EmptyState icon="structure" title="The structure has not been published yet" />
          )}
        </div>
      </section>
    </>
  );
}
