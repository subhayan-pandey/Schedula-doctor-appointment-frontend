import Link from "next/link";
import type { Doctor } from "@/types/doctor";

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <article className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-base font-semibold text-[var(--brand-deep)]">
          {doctor.avatarInitials}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-[var(--ink)]">{doctor.name}</h3>
          <p className="text-sm font-medium text-[var(--brand-deep)]">{doctor.specialty}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{doctor.qualification}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
            doctor.availableToday
              ? "bg-[var(--success-soft)] text-[var(--success)] ring-[var(--success)]/20"
              : "bg-stone-100 text-[var(--muted)] ring-[var(--line)]"
          }`}
        >
          {doctor.availableToday ? "Available today" : "Not available today"}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-[var(--ink)]">
          <svg width="12" height="12" viewBox="0 0 20 20" fill="#f2b01e" aria-hidden="true">
            <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
          </svg>
          {doctor.rating}
          <span className="text-[var(--muted)]">({doctor.reviewsCount})</span>
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">{doctor.bio}</p>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
        <span>{doctor.location}</span>
        <span>{doctor.timing}</span>
      </div>

      <Link
        href={`/doctors/${doctor.id}`}
        className="mt-4 block rounded-lg bg-[var(--brand)] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
      >
        Book appointment
      </Link>
    </article>
  );
}