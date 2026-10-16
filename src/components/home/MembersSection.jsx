import { Link } from 'react-router-dom';
import SectionHeading from '../SectionHeading.jsx';
import MemberGrid from '../MemberGrid.jsx';
import Icon from '../Icon.jsx';
import { EmptyState, SkeletonGrid } from '../States.jsx';
import { useContent } from '../../context/ContentContext.jsx';

const PREVIEW_COUNT = 10;

export default function MembersSection() {
  const { content, status } = useContent();
  const members = content.members;

  return (
    <section className="section" aria-labelledby="members-title">
      <div className="container">
        <SectionHeading
          id="members-title"
          eyebrow="Class members"
          title="Everyone in XI TJKT-1"
          description={members.length ? `${members.length} ${members.length === 1 ? 'student' : 'students'}, one class.` : undefined}
        />
        {status === 'loading' ? (
          <SkeletonGrid count={5} />
        ) : members.length ? (
          <MemberGrid members={members.slice(0, PREVIEW_COUNT)} />
        ) : (
          <EmptyState icon="users" title="Member profiles are on the way">
            Students will appear here once their names and photos are added with permission.
          </EmptyState>
        )}
        <div className="section__footer">
          <Link to="/members" className="btn">
            View All Members
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
