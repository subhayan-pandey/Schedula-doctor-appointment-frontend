"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { isValidEmail, isValidMobile } from "@/lib/utils/validators";
import { SPECIALTIES, type Specialty } from "@/types/doctor";
import type { DoctorAccount } from "@/types/doctorAccount";

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  experienceYears?: string;
  clinic?: string;
  location?: string;
};

export default function DoctorProfileForm({
  account,
  onCancel,
  onSave,
}: {
  account: DoctorAccount;
  onCancel: () => void;
  onSave: (updated: Omit<DoctorAccount, "id">) => void;
}) {
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email);
  const [phone, setPhone] = useState(account.phone);
  const [specialty, setSpecialty] = useState<Specialty>(account.specialty);
  const [experienceYears, setExperienceYears] = useState(String(account.experienceYears));
  const [clinic, setClinic] = useState(account.clinic);
  const [location, setLocation] = useState(account.location);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    if (name.trim().length < 2) nextErrors.name = "Enter your full name";
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address";
    if (!isValidMobile(phone)) nextErrors.phone = "Enter a valid 10-digit mobile number";
    const experience = Number(experienceYears);
    if (!experienceYears || Number.isNaN(experience) || experience < 0) {
      nextErrors.experienceYears = "Enter years of experience";
    }
    if (clinic.trim().length < 2) nextErrors.clinic = "Enter your clinic or hospital name";
    if (location.trim().length < 2) nextErrors.location = "Enter your practice location";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    // Simulated save delay — updates are written straight to localStorage.
    window.setTimeout(() => {
      onSave({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        specialty,
        experienceYears: Number(experienceYears),
        clinic: clinic.trim(),
        location: location.trim(),
      });
      setIsSaving(false);
    }, 400);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6"
    >
      <p className="font-semibold text-[var(--ink)]">Edit profile</p>

      <div className="mt-5 flex flex-col gap-5">
        <TextField
          id="profile-name"
          label="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="profile-email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          <TextField
            id="profile-phone"
            label="Phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            error={errors.phone}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-specialty" className="text-sm font-medium text-[var(--ink)]">
              Specialty
            </label>
            <select
              id="profile-specialty"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value as Specialty)}
              className="rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
            >
              {SPECIALTIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <TextField
            id="profile-experience"
            label="Years of experience"
            type="number"
            min={0}
            value={experienceYears}
            onChange={(event) => setExperienceYears(event.target.value)}
            error={errors.experienceYears}
          />
        </div>

        <TextField
          id="profile-clinic"
          label="Clinic / Hospital"
          value={clinic}
          onChange={(event) => setClinic(event.target.value)}
          error={errors.clinic}
        />
        <TextField
          id="profile-location"
          label="Location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          error={errors.location}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isSaving} className="sm:flex-1">
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="sm:flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}