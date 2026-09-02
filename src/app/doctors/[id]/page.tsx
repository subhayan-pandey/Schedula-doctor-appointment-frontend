"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDoctorById } from "@/lib/doctors-store";
import DoctorProfileCard from "@/features/doctors/components/DoctorProfileCard";
import BookingPanel from "@/features/booking/components/BookingPanel";
import type { Doctor } from "@/types/doctor";

export default function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null | undefined>(undefined);

  // The doctor catalog lives in localStorage (see lib/doctors-store.ts), so
  // it can only be read in the browser — this page is a client component
  // for that reason, unlike a typical Next.js detail page.
  useEffect(() => {
    Promise.resolve().then(() => setDoctor(getDoctorById(id) ?? null));
  }, [id]);

  if (doctor === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading doctor…
      </div>
    );
  }

  if (doctor === null) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <DoctorProfileCard doctor={doctor} />
        <BookingPanel doctorId={doctor.id} />
      </div>
    </div>
  );
}