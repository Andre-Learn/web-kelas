/** Class mark: three nodes joined by links, a tiny network topology. Decorative; the name is always shown beside it. */
export default function BrandMark({ size = 28, className = '' }) {
  return (
    <svg
      className={`brand-mark ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16 7 7 24h18L16 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="7" cy="24" r="4" fill="currentColor" />
      <circle cx="25" cy="24" r="4" fill="currentColor" />
      <circle className="brand-mark__core" cx="16" cy="7" r="4.5" />
    </svg>
  );
}
