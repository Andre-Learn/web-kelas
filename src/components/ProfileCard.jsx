import { originalSrc, classPhotoFallback, memberPhotoFallback } from '../lib/images'

/* A profile card takes an object with name, role/number, optional photo.
   Missing photos show the labeled SVG fallback, never an invented face. */
export default function ProfileCard({ name, role, photo, photoKind = 'portrait' }) {
  const src = photo || (photoKind === 'portrait' ? memberPhotoFallback(name) : classPhotoFallback(photoKind, role))
  return (
    <figure className="profile-card">
      <img
        src={src}
        alt={`Foto ${name}`}
        width={photoKind === 'portrait' ? 320 : 640}
        height={photoKind === 'portrait' ? 320 : 360}
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        <strong>{name}</strong>
        {role && <span>{role}</span>}
      </figcaption>
    </figure>
  )
}
