import Link from "next/link";

import VerifiedBadge from "@/components/doctor/VerifiedBadge";

import { isDoctorVerified } from "@/lib/doctor-verification";

import type { Doctor } from "@/types/doctor";

export default function DoctorCard({
  doctor,
}: {
  doctor: Doctor;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand)]/30 hover:shadow-md sm:p-6">
      <div className="flex items-start gap-3.5">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-base font-semibold text-[var(--brand-deep)]">
          {doctor.avatarInitials}
        </span>

        <div className="min-w-0 pt-0.5">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[15px] font-semibold text-[var(--ink)]">
              {doctor.name}
            </h3>

            {isDoctorVerified(doctor) && <VerifiedBadge />}
          </div>

          <p className="mt-0.5 text-sm font-medium text-[var(--brand-deep)]">
            {doctor.specialty}
          </p>

          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
            {doctor.qualification}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
            doctor.availableToday
              ? "bg-[var(--success-soft)] text-[var(--success)] ring-[var(--success)]/20"
              : "bg-stone-100 text-[var(--muted)] ring-[var(--line)]"
          }`}
        >
          {doctor.availableToday
            ? "Available today"
            : "Not available today"}
        </span>

        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ink)]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 20 20"
            fill="#f2b01e"
            aria-hidden="true"
          >
            <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
          </svg>

          {doctor.rating}

          <span className="text-[var(--muted)]">
            ({doctor.reviewsCount})
          </span>
        </span>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
        {doctor.bio}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-2.5 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle
              cx="12"
              cy="10"
              r="2.5"
            />
          </svg>

          <span className="truncate">
            {doctor.location}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
            />
            <path d="M12 7v5l3 2" />
          </svg>

          <span>
            {doctor.timing}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="text-[var(--muted)]">
            Consultation
          </span>

          <span className="font-semibold text-[var(--ink)]">
            ₹{doctor.consultationFee}
          </span>
        </div>

        <Link
          href={`/doctors/${doctor.id}`}
          className="block rounded-lg bg-[var(--brand)] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--brand-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-soft)] focus-visible:ring-offset-2"
        >
          Book appointment
        </Link>
      </div>
    </article>
  );
}