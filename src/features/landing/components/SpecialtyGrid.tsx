import Link from "next/link";

type SpecialtyIcon =
  | "heart"
  | "skin"
  | "mind"
  | "medical"
  | "child"
  | "bone";

const specialties: {
  name: string;
  icon: SpecialtyIcon;
}[] = [
  {
    name: "Cardiologist",
    icon: "heart",
  },
  {
    name: "Dermatologist",
    icon: "skin",
  },
  {
    name: "Psychologist",
    icon: "mind",
  },
  {
    name: "General Physician",
    icon: "medical",
  },
  {
    name: "Pediatrician",
    icon: "child",
  },
  {
    name: "Orthopedic",
    icon: "bone",
  },
];

function SpecialtyIcon({
  icon,
}: {
  icon: SpecialtyIcon;
}) {
  if (icon === "heart") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.8 8.7c0 5.5-8.8 11.1-8.8 11.1S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" />
      </svg>
    );
  }

  if (icon === "skin") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3c3.8 0 6.5 2.3 6.5 5.8 0 5.2-3.2 8.8-6.5 12.2C8.7 17.6 5.5 14 5.5 8.8 5.5 5.3 8.2 3 12 3Z" />
        <path d="M9 8c1.2 1.1 1.9 2.6 1.9 4.2" />
      </svg>
    );
  }

  if (icon === "mind") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 4.5a3.5 3.5 0 0 0-3.3 4.7A3.8 3.8 0 0 0 7 16.5h1.5A3.5 3.5 0 0 0 12 20a3.5 3.5 0 0 0 3.5-3.5H17a3.8 3.8 0 0 0 1.3-7.3A3.5 3.5 0 0 0 15 4.5a3.5 3.5 0 0 0-6 0Z" />
        <path d="M9 10.5h.01" />
        <path d="M15 10.5h.01" />
        <path d="M10 14.5c1.2.8 2.8.8 4 0" />
      </svg>
    );
  }

  if (icon === "medical") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 3h6v5H9z" />
        <path d="M6 8h12v13H6z" />
        <path d="M9 13h6" />
        <path d="M12 10v6" />
      </svg>
    );
  }

  if (icon === "child") {
    return (
      <svg
        width="20"
        height="20"
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
          cy="7"
          r="3"
        />
        <path d="M6.5 21c.4-4.1 2.2-6.5 5.5-6.5s5.1 2.4 5.5 6.5" />
        <path d="M9 18h6" />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 3v6l2 2v4l-2 6" />
      <path d="M16 3v6l-2 2v4l2 6" />
      <path d="M8 9h8" />
    </svg>
  );
}

export default function SpecialtyGrid() {
  return (
    <section
      id="specialties"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-14"
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Search by specialty
        </h2>

        <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
          Jump straight to doctors who treat what you need.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {specialties.map(
          (specialty) => (
            <Link
              key={specialty.name}
              href={`/doctors?specialty=${encodeURIComponent(
                specialty.name,
              )}`}
              className="group flex min-h-[126px] flex-col items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-soft)]"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)] transition-colors group-hover:bg-white">
                <SpecialtyIcon
                  icon={specialty.icon}
                />
              </span>

              <span className="mt-3 text-sm font-medium text-[var(--ink)]">
                {specialty.name}
              </span>
            </Link>
          ),
        )}
      </div>
    </section>
  );
}