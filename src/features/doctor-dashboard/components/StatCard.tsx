export default function StatCard({
  label,
  value,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  accent?: "brand" | "urgent" | "success";
}) {
  const accentClass =
    accent === "urgent"
      ? "text-[var(--urgent-deep)]"
      : accent === "success"
        ? "text-[var(--success)]"
        : "text-[var(--brand-deep)]";

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className={`text-2xl font-semibold ${accentClass}`}>{value}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
}