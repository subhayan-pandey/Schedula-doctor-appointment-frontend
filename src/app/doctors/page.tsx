"use client";

import {
  Suspense,
} from "react";
import {
  useSearchParams,
} from "next/navigation";

import DoctorsExplorer from "@/features/doctors/components/DoctorsExplorer";
import {
  SPECIALTIES,
  type Specialty,
} from "@/types/doctor";

function DoctorsPageContent() {
  const searchParams =
    useSearchParams();

  const query =
    searchParams.get(
      "query",
    ) ?? "";

  const specialtyParam =
    searchParams.get(
      "specialty",
    );

  const specialty:
    | Specialty
    | "All" =
    SPECIALTIES.includes(
      specialtyParam as Specialty,
    )
      ? (specialtyParam as Specialty)
      : "All";

  return (
    <main className="bg-[var(--canvas)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
            Find care
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            Find a doctor
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)] sm:text-base">
            Browse doctors by specialty, availability, and location.
          </p>
        </div>

        <div className="mt-7">
          <DoctorsExplorer
            initialQuery={query}
            initialSpecialty={
              specialty
            }
          />
        </div>
      </div>
    </main>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-[var(--canvas)]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--line)]" />

            <div className="mt-2 h-5 w-80 max-w-full animate-pulse rounded bg-[var(--line)]" />
          </div>
        </main>
      }
    >
      <DoctorsPageContent />
    </Suspense>
  );
}