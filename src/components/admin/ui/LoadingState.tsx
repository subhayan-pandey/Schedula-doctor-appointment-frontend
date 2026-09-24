type LoadingStateProps = {
  message?: string;
  className?: string;
};

export default function LoadingState({
  message = "Loading…",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-16 text-center ${className}`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="grid size-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
        <div className="size-5 animate-spin rounded-full border-2 border-[var(--brand)]/25 border-t-[var(--brand)]" />
      </div>

      <p className="mt-4 text-sm font-medium text-[var(--muted)]">
        {message}
      </p>
    </div>
  );
}
