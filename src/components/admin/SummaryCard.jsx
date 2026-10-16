import Icon from '../Icon.jsx';

export default function SummaryCard({ icon, label, value, children }) {
  return (
    <article className="summary-card">
      <div className="summary-card__head">
        <span className="summary-card__icon">
          <Icon name={icon} size={18} />
        </span>
        <h2 className="summary-card__label">{label}</h2>
      </div>
      {value !== undefined ? <p className="summary-card__value">{value}</p> : null}
      {children}
    </article>
  );
}
