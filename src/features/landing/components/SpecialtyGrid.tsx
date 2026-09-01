import Link from "next/link";

const specialties = [
  { name: "Cardiologist", icon: "❤️" },
  { name: "Dermatologist", icon: "🧴" },
  { name: "Psychologist", icon: "🧠" },
  { name: "General Physician", icon: "🩺" },
  { name: "Pediatrician", icon: "🧒" },
  { name: "Orthopedic", icon: "🦴" },
];

export default function SpecialtyGrid() {
  return (
    <section id="specialties" className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Search by specialty
          </h2>
          <p className="mt-1 text-[var(--muted)]">
            Jump straight to doctors who treat what you need.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {specialties.map((specialty) => (
          <Link
            key={specialty.name}
            href={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
            className="flex flex-col items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-6 text-center transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
          >
            <span className="grid size-12 place-items-center rounded-full bg-[var(--brand-soft)] text-2xl">
              {specialty.icon}
            </span>
            <span className="text-sm font-medium text-[var(--ink)]">{specialty.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}