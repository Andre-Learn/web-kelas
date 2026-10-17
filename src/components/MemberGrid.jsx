import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Photo from './Photo.jsx';
import Icon from './Icon.jsx';
import Dialog, { DialogClose } from './Dialog.jsx';
import { RevealGroup, RevealItem } from './Reveal.jsx';

function MemberCard({ member, onOpen }) {
  return (
    <button type="button" className="member-card" onClick={() => onOpen(member)} aria-haspopup="dialog">
      <Photo
        src={member.photoThumb || member.photo}
        alt=""
        name={member.name}
        fallback="person"
        ratio="3 / 4"
        width={480}
        height={640}
        className="member-card__photo"
      />
      <span className="member-card__body">
        {member.number ? <span className="member-card__number mono">No. {String(member.number).padStart(2, '0')}</span> : null}
        <span className="member-card__name">{member.name}</span>
      </span>
    </button>
  );
}

/**
 * layout="grid": full directory grid.
 * layout="strip": one scroll-snapping row for the homepage, ending in a link to the full list.
 */
export default function MemberGrid({ members, layout = 'grid', total, moreHref }) {
  const [active, setActive] = useState(null);
  const closeRef = useRef(null);
  const strip = layout === 'strip';

  return (
    <>
      <RevealGroup
        as="ul"
        role="list"
        className={strip ? 'member-strip' : 'member-grid'}
        aria-label={strip ? 'Class members, scroll sideways for more' : undefined}
      >
        {members.map((member) => (
          <RevealItem as="li" key={member.id} className={strip ? 'member-strip__item' : undefined}>
            <MemberCard member={member} onOpen={setActive} />
          </RevealItem>
        ))}
        {strip && moreHref ? (
          <RevealItem as="li" className="member-strip__item">
            <Link to={moreHref} className="member-strip__more">
              <span className="member-strip__more-count mono">{total ?? members.length}</span>
              <span className="member-strip__more-label">
                See all {total ?? members.length}
                <Icon name="arrowRight" size={18} />
              </span>
            </Link>
          </RevealItem>
        ) : null}
      </RevealGroup>

      <Dialog open={Boolean(active)} onClose={() => setActive(null)} labelledBy="member-dialog-title" className="dialog--profile" initialFocusRef={closeRef}>
        {active ? (
          <div className="profile-view">
            <Photo
              src={active.photo || active.photoThumb}
              alt={`Portrait of ${active.name}`}
              name={active.name}
              fallback="person"
              ratio="3 / 4"
              loading="eager"
              className="profile-view__photo"
            />
            <div className="profile-view__body">
              {active.number ? <p className="eyebrow mono">No. {String(active.number).padStart(2, '0')}</p> : null}
              <h2 id="member-dialog-title" className="profile-view__name">
                {active.name}
              </h2>
              <p className="profile-view__intro">{active.intro || 'No introduction has been added yet.'}</p>
            </div>
            <DialogClose ref={closeRef} onClick={() => setActive(null)} className="dialog__close--float" />
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
