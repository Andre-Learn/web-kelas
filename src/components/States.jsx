export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <p className="empty-title">{title}</p>
      {description && <p className="empty-description">{description}</p>}
    </div>
  )
}

export function LoadingState({ label = 'Memuat...' }) {
  return (
    <p role="status" className="loading-state">{label}</p>
  )
}

export function ErrorState({ message = 'Terjadi kesalahan. Coba lagi.' }) {
  return (
    <div role="alert" className="error-state">{message}</div>
  )
}
