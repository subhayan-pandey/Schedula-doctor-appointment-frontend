import type { Doctor } from "@/types/doctor";

export default function DoctorProfileCard({
  doctor,
}: {
  doctor: Doctor;
}) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xl font-semibold text-[var(--brand-deep)]">
          {doctor.avatarInitials}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
              {doctor.name}
            </h1>

            {doctor.availableToday && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-xs font-medium text-[var(--success)]">
                <span className="size-1.5 rounded-full bg-[var(--success)]" />
                Available today
              </span>
            )}
          </div>

          <p className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
            {doctor.specialty}
          </p>

          <p className="mt-0.5 text-sm text-[var(--muted)]">
            {doctor.qualification}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
            <span>
              {doctor.clinic}
            </span>

            <span aria-hidden="true">
              ·
            </span>

            <span>
              {doctor.location}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--ink)]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="#f2b01e"
                aria-hidden="true"
              >
                <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
              </svg>

              {doctor.rating}
            </span>

            <span className="text-sm text-[var(--muted)]">
              {doctor.reviewsCount.toLocaleString()} reviews
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x divide-[var(--line)] rounded-xl bg-[var(--brand-soft)] py-4">
        <div className="px-3 text-center">
          <p className="text-lg font-semibold text-[var(--ink)]">
            {doctor.patientsCount.toLocaleString()}+
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            patients
          </p>
        </div>

        <div className="px-3 text-center">
          <p className="text-lg font-semibold text-[var(--ink)]">
            {doctor.experienceYears}+
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            years experience
          </p>
        </div>

        <div className="px-3 text-center">
          <p className="text-lg font-semibold text-[var(--ink)]">
            {doctor.rating}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            rating
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--ink)]">
          About Doctor
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {doctor.bio}
        </p>
      </div>

      <div className="mt-6 grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[var(--surface)] text-[var(--brand-deep)]">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v18" />
                <path d="M7 8h10" />
                <path d="M7 16h10" />
              </svg>
            </span>

            <p className="text-sm font-semibold text-[var(--ink)]">
              Consultation
            </p>
          </div>

          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--muted)]">
                Fee
              </dt>

              <dd className="font-semibold text-[var(--ink)]">
                ₹{doctor.consultationFee}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--muted)]">
                Specialty
              </dt>

              <dd className="text-right font-medium text-[var(--ink)]">
                {doctor.specialty}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[var(--surface)] text-[var(--brand-deep)]">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
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
            </span>

            <p className="text-sm font-semibold text-[var(--ink)]">
              Availability
            </p>
          </div>

          <p className="mt-3 text-sm font-medium text-[var(--ink)]">
            {doctor.timing}
          </p>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Typical consultation hours
          </p>
        </div>
      </div>
    </section>
  );
}