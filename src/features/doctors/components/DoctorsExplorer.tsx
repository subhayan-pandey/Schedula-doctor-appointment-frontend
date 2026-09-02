"use client";

import { useEffect, useMemo, useState } from "react";
import DoctorFilters, {
  type DoctorFiltersValue,
} from "@/features/doctors/components/DoctorFilters";
import DoctorList from "@/features/doctors/components/DoctorList";
import { getDoctors } from "@/features/doctors/api/getDoctors";
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
  const [loadError, setLoadError] = useState(false);
  const [filters, setFilters] = useState<DoctorFiltersValue>({
    query: initialQuery,
    specialty: initialSpecialty,
    availableOnly: false,
  });

  useEffect(() => {
    let isMounted = true;
    getDoctors()
      .then((data) => {
        if (isMounted) setDoctors(data);
      })
      .catch(() => {
        if (isMounted) setLoadError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
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
      ) : loadError ? (
        <p className="text-sm text-[var(--urgent-deep)]">
          Couldn&apos;t load doctors right now. Please refresh the page.
        </p>
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