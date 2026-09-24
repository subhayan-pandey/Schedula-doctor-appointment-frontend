"use client";

import {
  notFound,
  useParams,
} from "next/navigation";

import {
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import DoctorProfileCard from "@/features/doctors/components/DoctorProfileCard";

import BookingPanel from "@/features/booking/components/BookingPanel";

import {
  getAllDoctors,
} from "@/lib/doctors-store";

import {
  initializeDoctors,
} from "@/store/slices/doctorsSlice";

import type {
  AppDispatch,
  RootState,
} from "@/store";

export default function DoctorProfilePage() {
  const { id } =
    useParams<{
      id: string;
    }>();

  const dispatch =
    useDispatch<AppDispatch>();

  const doctor =
    useSelector(
      (state: RootState) =>
        state.doctors.doctors.find(
          (item) =>
            item.id === id,
        ) ?? null,
    );

  const initialized =
    useSelector(
      (state: RootState) =>
        state.doctors.initialized,
    );

  useEffect(() => {
    if (!initialized) {
      dispatch(
        initializeDoctors(
          getAllDoctors(),
        ),
      );
    }
  }, [
    dispatch,
    initialized,
  ]);

  if (!initialized) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading doctor…
      </div>
    );
  }

  if (!doctor) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <DoctorProfileCard
          doctor={doctor}
        />

        <BookingPanel
          doctorId={doctor.id}
        />
      </div>
    </div>
  );
}