import { useState } from 'react';
import Icon from './Icon.jsx';

export function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/**
 * Image with a reserved box and an honest fallback when the file is missing or fails to load.
 * fallback="person" shows initials, fallback="image" shows a neutral "no photo" tile.
 */
export default function Photo({
  src,
  alt = '',
  name = '',
  ratio,
  width,
  height,
  fallback = 'image',
  loading = 'lazy',
  sizes,
  className = '',
  fetchPriority,
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const style = ratio ? { aspectRatio: ratio } : undefined;
  const showImage = src && !failed;

  return (
    <div className={`photo ${loaded ? 'photo--loaded' : ''} ${className}`} style={style}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={loading}
          decoding="async"
          fetchpriority={fetchPriority}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="photo__fallback" role={alt || name ? 'img' : undefined} aria-label={alt || (name ? `No photo of ${name} yet` : undefined)}>
          {fallback === 'person' && initialsOf(name) ? (
            <span className="photo__initials" aria-hidden="true">
              {initialsOf(name)}
            </span>
          ) : (
            <Icon name={fallback === 'person' ? 'user' : 'image'} size={28} strokeWidth={1.5} />
          )}
        </div>
      )}
    </div>
  );
}
