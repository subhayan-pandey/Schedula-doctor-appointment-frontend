"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DoctorsExplorer from "@/features/doctors/components/DoctorsExplorer";
import { SPECIALTIES, type Specialty } from "@/types/doctor";

function DoctorsPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const specialtyParam = searchParams.get("specialty");
  const specialty: Specialty | "All" = SPECIALTIES.includes(specialtyParam as Specialty)
    ? (specialtyParam as Specialty)
    : "All";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
        Find a doctor
      </h1>
      <p className="mt-1 text-[var(--muted)]">
        Browse doctors by specialty, availability, and location.
      </p>

      <div className="mt-6">
        <DoctorsExplorer initialQuery={query} initialSpecialty={specialty} />
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={null}>
      <DoctorsPageContent />
    </Suspense>
  );
}