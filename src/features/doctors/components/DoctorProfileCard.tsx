import type { Doctor } from "@/types/doctor";

export default function DoctorProfileCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xl font-semibold text-[var(--brand-deep)]">
          {doctor.avatarInitials}
        </span>
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink)]">{doctor.name}</h1>
          <p className="text-sm font-medium text-[var(--brand-deep)]">{doctor.specialty}</p>
          <p className="text-sm text-[var(--muted)]">{doctor.qualification}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {doctor.clinic}, {doctor.location}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-[var(--brand-soft)] p-4 text-center">
        <div>
          <p className="text-lg font-semibold text-[var(--ink)]">
            {doctor.patientsCount.toLocaleString()}+
          </p>
          <p className="text-xs text-[var(--muted)]">patients</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-[var(--ink)]">{doctor.experienceYears}+</p>
          <p className="text-xs text-[var(--muted)]">years exper.</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-[var(--ink)]">{doctor.rating}</p>
          <p className="text-xs text-[var(--muted)]">
            {doctor.reviewsCount.toLocaleString()} reviews
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="font-semibold text-[var(--ink)]">About Doctor</p>
        <p className="mt-1.5 text-sm text-[var(--muted)]">{doctor.bio}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-5 text-sm">
        <div>
          <p className="font-semibold text-[var(--ink)]">Service &amp; Specialization</p>
          <dl className="mt-2 space-y-1 text-[var(--muted)]">
            <div className="flex justify-between gap-2">
              <dt>Consultation fee</dt>
              <dd className="font-medium text-[var(--ink)]">₹{doctor.consultationFee}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Specialization</dt>
              <dd className="font-medium text-[var(--ink)]">{doctor.specialty}</dd>
            </div>
          </dl>
        </div>
        <div>
          <p className="font-semibold text-[var(--ink)]">Availability For Consulting</p>
          <p className="mt-2 text-[var(--muted)]">{doctor.timing}</p>
          <p
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              doctor.availableToday
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-stone-100 text-[var(--muted)]"
            }`}
          >
            {doctor.availableToday ? "Available today" : "Not available today"}
          </p>
        </div>
      </div>
    </div>
  );
}