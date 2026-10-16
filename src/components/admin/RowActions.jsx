import Icon from '../Icon.jsx';

/** Reorder / edit / delete buttons for one row in a managed list. */
export default function RowActions({ label, index, total, onMove, onEdit, onDelete, canMove = true }) {
  return (
    <div className="row-actions">
      {canMove ? (
        <>
          <button type="button" className="btn btn--icon btn--sm btn--ghost" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} up`}>
            <Icon name="arrowUp" size={16} />
          </button>
          <button
            type="button"
            className="btn btn--icon btn--sm btn--ghost"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Move ${label} down`}
          >
            <Icon name="arrowDown" size={16} />
          </button>
        </>
      ) : null}
      <button type="button" className="btn btn--icon btn--sm btn--ghost" onClick={onEdit} aria-label={`Edit ${label}`}>
        <Icon name="edit" size={16} />
      </button>
      <button type="button" className="btn btn--icon btn--sm btn--ghost row-actions__danger" onClick={onDelete} aria-label={`Remove ${label}`}>
        <Icon name="trash" size={16} />
      </button>
    </div>
  );
}
