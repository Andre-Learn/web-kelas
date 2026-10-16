import Icon from './Icon.jsx';

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p className="state__text">{label}</p>
    </div>
  );
}

export function EmptyState({ icon = 'image', title, children, action }) {
  return (
    <div className="state state--empty">
      <span className="state__icon">
        <Icon name={icon} size={22} />
      </span>
      <p className="state__title">{title}</p>
      {children ? <p className="state__text">{children}</p> : null}
      {action ? <div className="state__action">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', children, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <span className="state__icon">
        <Icon name="alert" size={22} />
      </span>
      <p className="state__title">{title}</p>
      {children ? <p className="state__text">{children}</p> : null}
      {onRetry ? (
        <div className="state__action">
          <button type="button" className="btn btn--sm" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SkeletonGrid({ count = 8, className = 'member-grid', ratio = '4 / 5' }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" style={{ aspectRatio: ratio }} />
      ))}
    </div>
  );
}
