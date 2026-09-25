import type { Doctor } from "@/types/doctor";

export default function RecentDoctorsList({
  doctors,
}: {
  doctors: Doctor[];
}) {
  if (doctors.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">No doctors yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--line)]">
      {doctors.map((doctor) => (
        <li
          key={doctor.id}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-semibold text-[var(--brand-deep)]">
            {doctor.avatarInitials}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--ink)]">
              {doctor.name}
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              {doctor.specialty} · {doctor.clinic}
            </p>
          </div>

          <p className="shrink-0 text-xs font-semibold text-[var(--muted)]">
            ★ {doctor.rating.toFixed(1)}
          </p>
        </li>
      ))}
    </ul>
  );
}
