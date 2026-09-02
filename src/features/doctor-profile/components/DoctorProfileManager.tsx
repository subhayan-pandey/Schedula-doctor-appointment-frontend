"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import DoctorProfileView from "@/features/doctor-profile/components/DoctorProfileView";
import DoctorProfileForm from "@/features/doctor-profile/components/DoctorProfileForm";
import { getSession, setSession } from "@/lib/storage";
import { getDoctorAccount, saveDoctorAccount } from "@/lib/doctor-account-store";
import { getDoctorById, addDoctor } from "@/lib/doctors-store";
import { getInitials } from "@/lib/utils/text";
import type { DoctorAccount } from "@/types/doctorAccount";

type Status = "loading" | "unauthorized" | "ready";

export default function DoctorProfileManager() {
  const [status, setStatus] = useState<Status>("loading");
  const [account, setAccount] = useState<DoctorAccount | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getSession();
      if (!session || session.role !== "doctor") {
        setStatus("unauthorized");
        return;
      }
      setAccount(getDoctorAccount());
      setStatus("ready");
    });
  }, []);

  function handleSave(updated: Omit<DoctorAccount, "id">) {
    if (!account) return;
    const nextAccount: DoctorAccount = { id: account.id, ...updated };

    saveDoctorAccount(nextAccount);

    // Keep the patient-facing catalog entry in sync, preserving fields the
    // profile form doesn't collect (rating, fee, reviews, etc.), and
    // deliberately leaving out email/phone — those stay private to the
    // doctor's own account, not the public catalog patients browse.
    const existingCatalogDoctor = getDoctorById(account.id);
    addDoctor({
      id: nextAccount.id,
      name: nextAccount.name,
      specialty: nextAccount.specialty,
      experienceYears: nextAccount.experienceYears,
      clinic: nextAccount.clinic,
      location: nextAccount.location,
      qualification: existingCatalogDoctor?.qualification ?? "MBBS",
      rating: existingCatalogDoctor?.rating ?? 5,
      reviewsCount: existingCatalogDoctor?.reviewsCount ?? 0,
      patientsCount: existingCatalogDoctor?.patientsCount ?? 0,
      consultationFee: existingCatalogDoctor?.consultationFee ?? 500,
      availableToday: existingCatalogDoctor?.availableToday ?? true,
      timing: existingCatalogDoctor?.timing ?? "09:00 AM - 5:00 PM",
      bio: `${nextAccount.name} is a ${nextAccount.specialty.toLowerCase()} practicing at ${nextAccount.clinic}, ${nextAccount.location}.`,
      avatarInitials: getInitials(nextAccount.name),
    });

    setSession({
      id: nextAccount.id,
      name: nextAccount.name,
      emailOrMobile: nextAccount.email,
      role: "doctor",
    });

    setAccount(nextAccount);
    setMode("view");
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading profile…
      </div>
    );
  }

  if (status === "unauthorized" || !account) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          You need to log in as a doctor
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Log in to view and edit your professional profile.
        </p>
        <Link href="/doctor/login" className="mt-6 inline-block">
          <Button>Doctor login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">My Profile</h1>
      <p className="mt-1 text-[var(--muted)]">
        This is what patients see when they view your listing.
      </p>

      <div className="mt-6">
        {mode === "view" ? (
          <DoctorProfileView account={account} onEdit={() => setMode("edit")} />
        ) : (
          <DoctorProfileForm
            account={account}
            onCancel={() => setMode("view")}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}