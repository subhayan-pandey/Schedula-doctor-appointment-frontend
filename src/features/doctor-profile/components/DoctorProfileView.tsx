import Button from "@/components/ui/Button";
import type { DoctorAccount } from "@/types/doctorAccount";

export default function DoctorProfileView({
  account,
  onEdit,
}: {
  account: DoctorAccount;
  onEdit: () => void;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Full name", value: account.name },
    { label: "Specialty", value: account.specialty },
    { label: "Experience", value: `${account.experienceYears} years` },
    { label: "Clinic / Hospital", value: account.clinic },
    { label: "Location", value: account.location },
    { label: "Email", value: account.email },
    { label: "Phone", value: account.phone },
  ];

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-[var(--brand-soft)] text-xl font-semibold text-[var(--brand-deep)]">
            {account.name
              .replace(/^dr\.?\s*/i, "")
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("")}
          </span>
          <div>
            <p className="text-lg font-semibold text-[var(--ink)]">{account.name}</p>
            <p className="text-sm text-[var(--brand-deep)]">{account.specialty}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit profile
        </Button>
      </div>

      <dl className="mt-6 grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              {row.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--ink)]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}