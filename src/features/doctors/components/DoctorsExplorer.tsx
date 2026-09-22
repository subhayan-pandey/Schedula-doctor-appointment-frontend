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

type ScoredDoctor = {
  doctor: Doctor;
  score: number;
};

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

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getSearchTokens(query: string) {
  return normalize(query)
    .split(" ")
    .filter(Boolean);
}

function scoreDoctor(
  doctor: Doctor,
  query: string,
): number {
  const normalizedQuery =
    normalize(query);

  if (!normalizedQuery) {
    return 0;
  }

  const tokens =
    getSearchTokens(query);

  const name =
    normalize(doctor.name);
  const specialty =
    normalize(doctor.specialty);
  const qualification =
    normalize(doctor.qualification);
  const clinic =
    normalize(doctor.clinic);
  const location =
    normalize(doctor.location);
  const timing =
    normalize(doctor.timing);
  const bio =
    normalize(doctor.bio);

  let score = 0;

  if (name === normalizedQuery) {
    score += 100;
  } else if (
    name.includes(normalizedQuery)
  ) {
    score += 80;
  }

  if (
    specialty === normalizedQuery
  ) {
    score += 75;
  } else if (
    specialty.includes(
      normalizedQuery,
    )
  ) {
    score += 60;
  }

  if (
    location.includes(
      normalizedQuery,
    )
  ) {
    score += 45;
  }

  if (
    clinic.includes(
      normalizedQuery,
    )
  ) {
    score += 35;
  }

  if (
    qualification.includes(
      normalizedQuery,
    )
  ) {
    score += 30;
  }

  if (
    timing.includes(
      normalizedQuery,
    )
  ) {
    score += 20;
  }

  if (
    bio.includes(
      normalizedQuery,
    )
  ) {
    score += 20;
  }

  for (const token of tokens) {
    if (name.includes(token)) {
      score += 20;
    }

    if (specialty.includes(token)) {
      score += 25;
    }

    if (location.includes(token)) {
      score += 15;
    }

    if (clinic.includes(token)) {
      score += 12;
    }

    if (
      qualification.includes(token)
    ) {
      score += 10;
    }

    if (timing.includes(token)) {
      score += 8;
    }

    if (bio.includes(token)) {
      score += 8;
    }
  }

  return score;
}

function getSmartResults(
  doctors: Doctor[],
  filters: DoctorFiltersValue,
): Doctor[] {
  const query =
    filters.query.trim();

  const filtered =
    doctors.filter((doctor) => {
      const matchesSpecialty =
        filters.specialty === "All" ||
        doctor.specialty ===
          filters.specialty;

      const matchesAvailability =
        !filters.availableOnly ||
        doctor.availableToday;

      return (
        matchesSpecialty &&
        matchesAvailability
      );
    });

  if (!query) {
    return filtered;
  }

  const scored: ScoredDoctor[] =
    filtered
      .map((doctor) => ({
        doctor,
        score: scoreDoctor(
          doctor,
          query,
        ),
      }))
      .filter(
        ({ score }) => score > 0,
      );

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (
      a.doctor.availableToday !==
      b.doctor.availableToday
    ) {
      return a.doctor
        .availableToday
        ? -1
        : 1;
    }

    if (
      b.doctor.rating !==
      a.doctor.rating
    ) {
      return (
        b.doctor.rating -
        a.doctor.rating
      );
    }

    return (
      b.doctor.reviewsCount -
      a.doctor.reviewsCount
    );
  });

  return scored.map(
    ({ doctor }) => doctor,
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
  ] = useState<Doctor[]>([]);

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
    useMemo(
      () =>
        getSmartResults(
          doctors,
          filters,
        ),
      [doctors, filters],
    );

  const hasSearchQuery =
    filters.query.trim()
      .length > 0;

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
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">
                {filteredDoctors.length}{" "}
                doctor
                {filteredDoctors.length ===
                1
                  ? ""
                  : "s"}{" "}
                found
              </p>

              {hasSearchQuery &&
                filteredDoctors.length >
                  0 && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Results are ordered by
                    relevance to your
                    search.
                  </p>
                )}
            </div>

            {filteredDoctors.length >
              0 && (
              <p className="text-xs text-[var(--muted)]">
                Select a doctor to view
                availability
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