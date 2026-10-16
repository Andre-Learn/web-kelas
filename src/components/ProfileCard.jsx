import Photo from './Photo.jsx';

/** Officer card for the class structure. Unfilled role slots are labelled as such. */
export default function ProfileCard({ person, size = 'md' }) {
  const hasName = Boolean(person.name?.trim());
  return (
    <article className={`profile-card profile-card--${size}`}>
      <Photo
        src={person.photo}
        alt={hasName ? `Portrait of ${person.name}` : ''}
        name={person.name}
        fallback="person"
        ratio="1 / 1"
        width={320}
        height={320}
        className="profile-card__photo"
      />
      <div className="profile-card__body">
        <p className="profile-card__role">{person.role}</p>
        <h3 className={`profile-card__name ${hasName ? '' : 'profile-card__name--empty'}`}>
          {hasName ? person.name : 'Not yet announced'}
        </h3>
        {person.description ? <p className="profile-card__desc">{person.description}</p> : null}
      </div>
    </article>
  );
}
