import AdminNavIcon from "@/components/admin/AdminNavIcon";

type StatCardProps = {
  label: string;
  value: string | number;
  iconKey?: string;
  caption?: string;
};

export default function StatCard({
  label,
  value,
  iconKey,
  caption,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {label}
        </p>

        {iconKey && (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <AdminNavIcon itemKey={iconKey} />
          </span>
        )}
      </div>

      <p className="mt-3 text-2xl font-semibold text-[var(--ink)]">
        {value}
      </p>

      {caption && (
        <p className="mt-1 text-xs text-[var(--muted)]">{caption}</p>
      )}
    </div>
  );
}
