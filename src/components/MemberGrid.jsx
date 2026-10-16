import { useRef, useState } from 'react';
import Photo from './Photo.jsx';
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
        ratio="4 / 5"
        width={480}
        height={600}
        className="member-card__photo"
      />
      <span className="member-card__body">
        {member.number ? <span className="member-card__number">No. {String(member.number).padStart(2, '0')}</span> : null}
        <span className="member-card__name">{member.name}</span>
      </span>
    </button>
  );
}

export default function MemberGrid({ members }) {
  const [active, setActive] = useState(null);
  const closeRef = useRef(null);

  return (
    <>
      <RevealGroup as="ul" role="list" className="member-grid">
        {members.map((member) => (
          <RevealItem as="li" key={member.id}>
            <MemberCard member={member} onOpen={setActive} />
          </RevealItem>
        ))}
      </RevealGroup>

      <Dialog open={Boolean(active)} onClose={() => setActive(null)} labelledBy="member-dialog-title" className="dialog--profile" initialFocusRef={closeRef}>
        {active ? (
          <div className="profile-view">
            <Photo
              src={active.photo || active.photoThumb}
              alt={`Portrait of ${active.name}`}
              name={active.name}
              fallback="person"
              ratio="4 / 5"
              loading="eager"
              className="profile-view__photo"
            />
            <div className="profile-view__body">
              {active.number ? <p className="eyebrow">No. {String(active.number).padStart(2, '0')}</p> : null}
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
