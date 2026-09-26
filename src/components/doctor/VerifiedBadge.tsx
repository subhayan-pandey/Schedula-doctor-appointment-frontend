export default function VerifiedBadge({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      title="Verified by Schedula"
      className={`inline-flex items-center gap-1 rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--brand-deep)] ${className}`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.4 7 8.9 4.1-1.5 7-4.7 7-8.9V6z" />
        <path d="m9.2 12 1.9 1.9L15 10" />
      </svg>
      Verified
    </span>
  );
}
