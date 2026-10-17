import { Link } from 'react-router-dom';
import SectionHeading from '../SectionHeading.jsx';
import MemberGrid from '../MemberGrid.jsx';
import Icon from '../Icon.jsx';
import { EmptyState } from '../States.jsx';
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
          index="03"
          eyebrow="Members"
          title="Everyone in XI TJKT-1"
          description={members.length ? `${members.length} ${members.length === 1 ? 'student' : 'students'}, one class.` : undefined}
          action={
            members.length ? (
              <Link to="/members" className="text-link">
                All members
                <Icon name="arrowRight" size={16} />
              </Link>
            ) : null
          }
        />
        {status === 'loading' ? (
          <div className="member-strip" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="member-strip__item">
                <div className="skeleton skeleton--member" />
              </div>
            ))}
          </div>
        ) : members.length ? (
          <MemberGrid layout="strip" members={members.slice(0, PREVIEW_COUNT)} total={members.length} moreHref="/members" />
        ) : (
          <EmptyState icon="users" title="Member profiles are on the way">
            Students will appear here once their names and photos are added with permission.
          </EmptyState>
        )}
      </div>
    </section>
  );
}
