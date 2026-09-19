"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import DoctorProfileForm from "@/features/doctor-profile/components/DoctorProfileForm";
import DoctorProfileView from "@/features/doctor-profile/components/DoctorProfileView";

import {
  getDoctorAccount,
  saveDoctorAccount,
} from "@/lib/doctor-account-store";

import {
  addDoctor,
  getDoctorById,
} from "@/lib/doctors-store";

import { getSession, setSession } from "@/lib/storage";
import { getInitials } from "@/lib/utils/text";

import type { DoctorAccount } from "@/types/doctorAccount";

type Status =
  | "loading"
  | "unauthorized"
  | "ready";

export default function DoctorProfileManager() {
  const [status, setStatus] =
    useState<Status>("loading");

  const [account, setAccount] =
    useState<DoctorAccount | null>(null);

  const [mode, setMode] =
    useState<"view" | "edit">("view");

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getSession();

      if (
        !session ||
        session.role !== "doctor"
      ) {
        setStatus("unauthorized");
        return;
      }

      setAccount(getDoctorAccount());
      setStatus("ready");
    });
  }, []);

  function handleSave(
    updated: Omit<DoctorAccount, "id">,
  ) {
    if (!account) {
      return;
    }

    const nextAccount: DoctorAccount = {
      id: account.id,
      ...updated,
    };

    saveDoctorAccount(nextAccount);

    /*
     * Keep the patient-facing doctor catalog
     * synchronized with editable professional
     * profile fields.
     *
     * Private account fields such as email and
     * phone remain private and are not added to
     * the public catalog.
     */
    const existingCatalogDoctor =
      getDoctorById(account.id);

    addDoctor({
      id: nextAccount.id,
      name: nextAccount.name,
      specialty: nextAccount.specialty,
      experienceYears:
        nextAccount.experienceYears,
      clinic: nextAccount.clinic,
      location: nextAccount.location,
      qualification:
        existingCatalogDoctor?.qualification ??
        "MBBS",
      rating:
        existingCatalogDoctor?.rating ??
        5,
      reviewsCount:
        existingCatalogDoctor?.reviewsCount ??
        0,
      patientsCount:
        existingCatalogDoctor?.patientsCount ??
        0,
      consultationFee:
        existingCatalogDoctor?.consultationFee ??
        500,
      availableToday:
        existingCatalogDoctor?.availableToday ??
        true,
      timing:
        existingCatalogDoctor?.timing ??
        "09:00 AM - 5:00 PM",
      bio: `${nextAccount.name} is a ${nextAccount.specialty.toLowerCase()} practicing at ${nextAccount.clinic}, ${nextAccount.location}.`,
      avatarInitials:
        getInitials(nextAccount.name),
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
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
        <DoctorProfileSkeleton />
      </div>
    );
  }

  if (
    status === "unauthorized" ||
    !account
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="size-6"
            aria-hidden="true"
          >
            <path
              d="M12 3.5 19 7v5c0 4.3-2.7 7.3-7 8.8C7.7 19.3 5 16.3 5 12V7l7-3.5Z"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 12.5 11.3 14l3.5-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-[var(--ink)]">
          Doctor access required
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
          Log in with a doctor account
          to view and edit your
          professional profile.
        </p>

        <Link
          href="/doctor/login"
          className="mt-6 inline-block"
        >
          <Button>
            Doctor login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <header className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-lg font-semibold text-[var(--brand-deep)]">
              {getInitials(account.name)}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
                Professional profile
              </p>

              <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-[var(--ink)]">
                {account.name}
              </h1>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {account.specialty} ·{" "}
                {account.experienceYears}{" "}
                {account.experienceYears === 1
                  ? "year"
                  : "years"}{" "}
                experience
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/doctor/appointments">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
              >
                Appointments
              </Button>
            </Link>

            <Link href="/doctor/slot">
              <Button
                className="w-full sm:w-auto"
              >
                Manage availability
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mt-5">
        {mode === "view" ? (
          <DoctorProfileView
            account={account}
            onEdit={() => setMode("edit")}
          />
        ) : (
          <DoctorProfileForm
            account={account}
            onCancel={() =>
              setMode("view")
            }
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}

function DoctorProfileSkeleton() {
  return (
    <div
      className="animate-pulse"
      aria-label="Loading doctor profile"
    >
      <div className="h-32 rounded-2xl bg-[var(--canvas)]" />

      <div className="mt-5 rounded-2xl bg-[var(--canvas)] p-6">
        <div className="h-6 w-44 rounded bg-[var(--line)]" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="h-16 rounded-xl bg-[var(--line)]" />
          <div className="h-16 rounded-xl bg-[var(--line)]" />
          <div className="h-16 rounded-xl bg-[var(--line)]" />
          <div className="h-16 rounded-xl bg-[var(--line)]" />
        </div>
      </div>
    </div>
  );
}