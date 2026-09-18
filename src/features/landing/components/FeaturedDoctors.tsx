import Link from "next/link";

import DoctorCard from "@/components/doctor/DoctorCard";
import { doctors } from "@/lib/mock-data/doctors";

export default function FeaturedDoctors() {
  const featured =
    doctors.slice(0, 3);

  return (
    <section className="bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
              Trusted specialists
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
              Featured doctors
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Highly rated doctors available for booking today.
            </p>
          </div>

          <Link
            href="/doctors"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-deep)] transition-colors hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-soft)]"
          >
            View all doctors
            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        <div className="mt-7 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(
            (doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}