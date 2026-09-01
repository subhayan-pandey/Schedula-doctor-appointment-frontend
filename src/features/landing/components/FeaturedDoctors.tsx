import Link from "next/link";
import { doctors } from "@/lib/mock-data/doctors";
import DoctorCard from "@/components/doctor/DoctorCard";

export default function FeaturedDoctors() {
  const featured = doctors.slice(0, 3);

  return (
    <section className="bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
              Featured doctors
            </h2>
            <p className="mt-1 text-[var(--muted)]">
              Highly rated doctors available for booking today.
            </p>
          </div>
          <Link
            href="/doctors"
            className="text-sm font-semibold text-[var(--brand-deep)] hover:text-[var(--brand)]"
          >
            View all doctors →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </section>
  );
}