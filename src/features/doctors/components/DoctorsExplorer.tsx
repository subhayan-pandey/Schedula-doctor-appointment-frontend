"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import DoctorFilters, {
  type DoctorFiltersValue,
} from "@/features/doctors/components/DoctorFilters";
import DoctorList from "@/features/doctors/components/DoctorList";

import { getAllDoctors } from "@/lib/doctors-store";

import type {
  Doctor,
  Specialty,
} from "@/types/doctor";

function DoctorCardSkeleton() {
  return (
    <div className="h-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3.5">
        <div className="size-14 shrink-0 animate-pulse rounded-full bg-[var(--line)]" />

        <div className="min-w-0 flex-1">
          <div className="h-4 w-32 animate-pulse rounded bg-[var(--line)]" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[var(--line)]" />
          <div className="mt-2 h-3 w-36 animate-pulse rounded bg-[var(--line)]" />
        </div>
      </div>

      <div className="mt-4 h-6 w-28 animate-pulse rounded-full bg-[var(--line)]" />

      <div className="mt-5 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-[var(--line)]" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--line)]" />
      </div>

      <div className="mt-5 border-t border-[var(--line)] pt-4">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--line)]" />
        <div className="mt-2 h-3 w-32 animate-pulse rounded bg-[var(--line)]" />
      </div>

      <div className="mt-5 h-10 w-full animate-pulse rounded-lg bg-[var(--line)]" />
    </div>
  );
}

export default function DoctorsExplorer({
  initialQuery = "",
  initialSpecialty = "All",
}: {
  initialQuery?: string;
  initialSpecialty?: Specialty | "All";
}) {
  const [
    doctors,
    setDoctors,
  ] = useState<Doctor[]>(
    [],
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    filters,
    setFilters,
  ] =
    useState<DoctorFiltersValue>({
      query: initialQuery,
      specialty:
        initialSpecialty,
      availableOnly: false,
    });

  useEffect(() => {
    Promise.resolve().then(() => {
      setDoctors(
        getAllDoctors(),
      );
      setIsLoading(false);
    });
  }, []);

  const filteredDoctors =
    useMemo(() => {
      const query =
        filters.query
          .trim()
          .toLowerCase();

      return doctors.filter(
        (doctor) => {
          const matchesQuery =
            query.length === 0 ||
            doctor.name
              .toLowerCase()
              .includes(query) ||
            doctor.specialty
              .toLowerCase()
              .includes(query);

          const matchesSpecialty =
            filters.specialty ===
              "All" ||
            doctor.specialty ===
              filters.specialty;

          const matchesAvailability =
            !filters.availableOnly ||
            doctor.availableToday;

          return (
            matchesQuery &&
            matchesSpecialty &&
            matchesAvailability
          );
        },
      );
    }, [
      doctors,
      filters,
    ]);

  return (
    <div className="flex flex-col gap-5">
      <DoctorFilters
        value={filters}
        onChange={setFilters}
      />

      {isLoading ? (
        <>
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 animate-pulse rounded bg-[var(--line)]" />
          </div>

          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DoctorCardSkeleton />
            <DoctorCardSkeleton />
            <DoctorCardSkeleton />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[var(--ink)]">
              {filteredDoctors.length} doctor
              {filteredDoctors.length ===
              1
                ? ""
                : "s"} found
            </p>

            {filteredDoctors.length >
              0 && (
              <p className="text-xs text-[var(--muted)]">
                Select a doctor to view availability
              </p>
            )}
          </div>

          <DoctorList
            doctors={
              filteredDoctors
            }
          />
        </>
      )}
    </div>
  );
}