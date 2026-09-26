import StatusBadge from "@/components/admin/ui/StatusBadge";

import {
  getVerificationLabel,
  getVerificationTone,
  type AdminDoctorView,
} from "@/lib/admin/admin-doctors";

export function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-[var(--ink)]">{value}</p>
    </div>
  );
}

export default function DoctorProfileSummary({
  doctor,
}: {
  doctor: AdminDoctorView;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-lg font-semibold text-[var(--brand-deep)]">
          {doctor.avatarInitials}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-[var(--ink)]">
            {doctor.name}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {doctor.specialty} · {doctor.qualification}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge
              label={doctor.isActive ? "Active" : "Inactive"}
              tone={doctor.isActive ? "success" : "neutral"}
              withDot
            />
            <StatusBadge
              label={getVerificationLabel(doctor.verificationStatus)}
              tone={getVerificationTone(doctor.verificationStatus)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <DetailRow label="Experience" value={`${doctor.experienceYears} yrs`} />
        <DetailRow label="Rating" value={`★ ${doctor.rating.toFixed(1)} (${doctor.reviewsCount})`} />
        <DetailRow label="Patients seen" value={String(doctor.patientsCount)} />
        <DetailRow label="Consultation fee" value={`₹${doctor.consultationFee}`} />
        <DetailRow label="Timing" value={doctor.timing} />
        <DetailRow
          label="Available today"
          value={doctor.availableToday ? "Yes" : "No"}
        />
      </div>

      <DetailRow label="Clinic" value={`${doctor.clinic} · ${doctor.location}`} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Bio
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--ink)]">
          {doctor.bio}
        </p>
      </div>
    </div>
  );
}
