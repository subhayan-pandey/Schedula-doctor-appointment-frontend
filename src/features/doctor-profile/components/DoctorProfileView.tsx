import Button from "@/components/ui/Button";
import type { DoctorAccount } from "@/types/doctorAccount";

export default function DoctorProfileView({
  account,
  onEdit,
}: {
  account: DoctorAccount;
  onEdit: () => void;
}) {
  const initials = account.name
    .replace(/^dr\.?\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ?? "",
    )
    .join("");

  const rows: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[] = [
    {
      label: "Full name",
      value: account.name,
      icon: <PersonIcon />,
    },
    {
      label: "Specialty",
      value: account.specialty,
      icon: <SpecialtyIcon />,
    },
    {
      label: "Experience",
      value: `${account.experienceYears} ${
        account.experienceYears === 1
          ? "year"
          : "years"
      }`,
      icon: <ExperienceIcon />,
    },
    {
      label: "Clinic / Hospital",
      value: account.clinic,
      icon: <ClinicIcon />,
    },
    {
      label: "Location",
      value: account.location,
      icon: <LocationIcon />,
    },
    {
      label: "Email",
      value: account.email,
      icon: <MailIcon />,
    },
    {
      label: "Phone",
      value: account.phone,
      icon: <PhoneIcon />,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
      <div className="bg-[var(--canvas)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-xl font-semibold text-[var(--brand-deep)]">
              {initials || "DR"}
            </div>

            <div className="min-w-0">
              <p className="text-lg font-semibold text-[var(--ink)]">
                {account.name}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-deep)]">
                  {account.specialty}
                </span>

                <span className="text-xs text-[var(--muted)]">
                  Professional profile
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="w-full sm:w-auto"
          >
            Edit profile
          </Button>
        </div>
      </div>

      <div className="border-t border-[var(--line)] p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)]">
                  {row.icon}
                </span>

                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {row.label}
                  </dt>

                  <dd className="mt-1 break-words text-sm font-medium leading-6 text-[var(--ink)]">
                    {row.value}
                  </dd>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--line)] bg-[var(--canvas)] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <InfoIcon />
          </span>

          <div>
            <p className="text-sm font-medium text-[var(--ink)]">
              Public profile
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              Your name, specialty, experience,
              clinic, and location can appear in
              the patient-facing doctor listing.
              Your email and phone remain part of
              your doctor account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3" />
      <path
        d="M5.5 20c.8-3.5 3-5.3 6.5-5.3s5.7 1.8 6.5 5.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpecialtyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path
        d="M8 4h8v16H8z"
        strokeLinejoin="round"
      />
      <path
        d="M10 8h4M10 12h4M10 16h3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExperienceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path
        d="M12 7v5l3 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClinicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path
        d="M4 20h16M6 20V7h12v13M9 7V4h6v3M9 11h6M9 14h6M9 17h6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path
        d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="6"
        width="16"
        height="12"
        rx="2"
      />
      <path
        d="m5 8 7 5 7-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path
        d="M7.5 4.5h2l1 4-1.8 1.4a14.2 14.2 0 0 0 5.4 5.4l1.4-1.8 4 1v2c0 1.1-.9 2-2 2C11.2 18.5 5.5 12.8 5.5 6.5c0-1.1.9-2 2-2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path
        d="M12 10v5"
        strokeLinecap="round"
      />
      <path
        d="M12 7.5h.01"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}