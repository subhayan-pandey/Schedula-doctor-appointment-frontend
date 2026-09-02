type StatCardProps = {
  label: string;
  value: string | number;
  description?: string;
};

export default function StatCard({
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <p className="text-sm font-medium text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ink)]">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-xs text-[var(--muted)]">
          {description}
        </p>
      )}
    </div>
  );
}