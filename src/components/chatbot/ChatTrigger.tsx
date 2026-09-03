"use client";

type ChatTriggerProps = {
  onClick: () => void;
};

export default function ChatTrigger({
  onClick,
}: ChatTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open Schedula Guide"
      className="group flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 shadow-[0_10px_30px_rgba(18,36,43,0.12)] transition duration-150 hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-[0_14px_36px_rgba(18,36,43,0.15)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-soft)] sm:px-3.5"
    >
      <span className="grid size-7 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
          <path d="M8 10h8" />
          <path d="M8 14h5" />
        </svg>
      </span>

      <span className="pr-0.5 text-sm font-semibold text-[var(--ink)]">
        Need help?
      </span>
    </button>
  );
}