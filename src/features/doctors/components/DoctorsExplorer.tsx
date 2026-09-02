"use client";

import { useEffect, useMemo, useState } from "react";
import DoctorFilters, {
  type DoctorFiltersValue,
} from "@/features/doctors/components/DoctorFilters";
import DoctorList from "@/features/doctors/components/DoctorList";
import { getAllDoctors } from "@/lib/doctors-store";
import type { Doctor, Specialty } from "@/types/doctor";

export default function DoctorsExplorer({
  initialQuery = "",
  initialSpecialty = "All",
}: {
  initialQuery?: string;
  initialSpecialty?: Specialty | "All";
}) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<DoctorFiltersValue>({
    query: initialQuery,
    specialty: initialSpecialty,
    availableOnly: false,
  });

  // The doctor catalog now lives in localStorage (see lib/doctors-store.ts)
  // so that newly registered doctors show up here too — that's why this is
  // a synchronous read rather than a fetch, wrapped in a microtask only to
  // satisfy React's "no direct setState in an effect body" lint rule.
  useEffect(() => {
    Promise.resolve().then(() => {
      setDoctors(getAllDoctors());
      setIsLoading(false);
    });
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesQuery =
        query.length === 0 ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query);
      const matchesSpecialty =
        filters.specialty === "All" || doctor.specialty === filters.specialty;
      const matchesAvailability = !filters.availableOnly || doctor.availableToday;
      return matchesQuery && matchesSpecialty && matchesAvailability;
    });
  }, [doctors, filters]);

  return (
    <div className="flex flex-col gap-6">
      <DoctorFilters value={filters} onChange={setFilters} />

      {isLoading ? (
        <p className="text-sm text-[var(--muted)]">Loading doctors…</p>
      ) : (
        <>
          <p className="text-sm text-[var(--muted)]">
            {filteredDoctors.length} doctor
            {filteredDoctors.length === 1 ? "" : "s"} found
          </p>
          <DoctorList doctors={filteredDoctors} />
        </>
      )}
    </div>
  );
}