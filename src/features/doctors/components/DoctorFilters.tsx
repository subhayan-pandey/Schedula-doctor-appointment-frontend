import { SPECIALTIES, type Specialty } from "@/types/doctor";

export type DoctorFiltersValue = {
  query: string;
  specialty: Specialty | "All";
  availableOnly: boolean;
};

export default function DoctorFilters({
  value,
  onChange,
}: {
  value: DoctorFiltersValue;
  onChange: (next: DoctorFiltersValue) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:gap-5">
      <div className="flex-1">
        <label htmlFor="doctor-filter-search" className="sr-only">
          Search doctors
        </label>
        <input
          id="doctor-filter-search"
          type="text"
          placeholder="Search by doctor name, specialty, or condition"
          value={value.query}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
          className="w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="doctor-filter-specialty" className="text-sm font-medium text-[var(--muted)]">
          Specialty
        </label>
        <select
          id="doctor-filter-specialty"
          value={value.specialty}
          onChange={(event) =>
            onChange({ ...value, specialty: event.target.value as Specialty | "All" })
          }
          className="rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
        >
          <option value="All">All specialties</option>
          {SPECIALTIES.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
        <input
          type="checkbox"
          checked={value.availableOnly}
          onChange={(event) => onChange({ ...value, availableOnly: event.target.checked })}
          className="size-4 rounded border-[var(--line)] text-[var(--brand)]"
        />
        Available today only
      </label>
    </div>
  );
}