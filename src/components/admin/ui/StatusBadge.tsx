export type StatusTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  withDot?: boolean;
  className?: string;
};

const toneStyles: Record<StatusTone, string> = {
  neutral: "bg-[var(--line)]/40 text-[var(--muted)]",
  brand: "bg-[var(--brand-soft)] text-[var(--brand-deep)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--urgent-soft)] text-[var(--urgent-deep)]",
};

const dotStyles: Record<StatusTone, string> = {
  neutral: "bg-[var(--muted)]",
  brand: "bg-[var(--brand)]",
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--urgent)]",
};

export default function StatusBadge({
  label,
  tone = "neutral",
  withDot = false,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${toneStyles[tone]} ${className}`}
    >
      {withDot && (
        <span
          className={`size-1.5 rounded-full ${dotStyles[tone]}`}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}
