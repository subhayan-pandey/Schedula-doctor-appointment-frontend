"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { setSession } from "@/lib/storage";
import { saveDoctorAccount } from "@/lib/doctor-account-store";
import { addDoctor } from "@/lib/doctors-store";
import { getInitials } from "@/lib/utils/text";
import {
  isValidEmail,
  isValidMobile,
  isValidPassword,
} from "@/lib/utils/validators";
import { SPECIALTIES, type Specialty } from "@/types/doctor";

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  experienceYears?: string;
  clinic?: string;
  location?: string;
};

export default function DoctorRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specialty, setSpecialty] = useState<Specialty>(SPECIALTIES[0]);
  const [experienceYears, setExperienceYears] = useState("");
  const [clinic, setClinic] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    if (name.trim().length < 2) nextErrors.name = "Enter your full name";
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address";
    if (!isValidMobile(phone)) nextErrors.phone = "Enter a valid 10-digit mobile number";
    if (!isValidPassword(password)) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
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

    setIsSubmitting(true);
    // Simulated network delay — there is no real backend in this project.
    window.setTimeout(() => {
      const accountId = `doctor-${Date.now()}`;
      const trimmedName = name.trim();

      saveDoctorAccount({
        id: accountId,
        name: trimmedName,
        email: email.trim(),
        phone: phone.trim(),
        specialty,
        experienceYears: Number(experienceYears),
        clinic: clinic.trim(),
        location: location.trim(),
      });

      // A registered doctor also becomes bookable in the patient-facing
      // catalog, using the same id — this is what lets the doctor create
      // slots and immediately show up for patients to book in Phase 9/11.
      addDoctor({
        id: accountId,
        name: trimmedName,
        specialty,
        qualification: "MBBS",
        experienceYears: Number(experienceYears),
        clinic: clinic.trim(),
        location: location.trim(),
        rating: 5,
        reviewsCount: 0,
        patientsCount: 0,
        consultationFee: 500,
        availableToday: true,
        timing: "09:00 AM - 5:00 PM",
        bio: `${trimmedName} is a ${specialty.toLowerCase()} practicing at ${clinic.trim()}, ${location.trim()}.`,
        avatarInitials: getInitials(trimmedName),
      });

      setSession({
        id: accountId,
        name: trimmedName,
        emailOrMobile: email.trim(),
        role: "doctor",
      });

      setIsSubmitting(false);
      router.push("/doctor/dashboard");
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        id="doctor-register-name"
        label="Full name"
        placeholder="Dr. Your Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        autoComplete="name"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="doctor-register-email"
          label="Email"
          type="email"
          placeholder="you@clinic.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          id="doctor-register-phone"
          label="Phone"
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          error={errors.phone}
          autoComplete="tel"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="doctor-register-password"
          label="Password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <TextField
          id="doctor-register-confirm-password"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="doctor-register-specialty" className="text-sm font-medium text-[var(--ink)]">
            Specialty
          </label>
          <select
            id="doctor-register-specialty"
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
          id="doctor-register-experience"
          label="Years of experience"
          type="number"
          min={0}
          placeholder="e.g. 8"
          value={experienceYears}
          onChange={(event) => setExperienceYears(event.target.value)}
          error={errors.experienceYears}
        />
      </div>

      <TextField
        id="doctor-register-clinic"
        label="Clinic / Hospital"
        placeholder="Name of your clinic or hospital"
        value={clinic}
        onChange={(event) => setClinic(event.target.value)}
        error={errors.clinic}
      />
      <TextField
        id="doctor-register-location"
        label="Location"
        placeholder="City / area you practice in"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        error={errors.location}
      />

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create doctor account"}
      </Button>

      <p className="text-center text-sm text-[var(--muted)]">
        Already registered?{" "}
        <Link href="/doctor/login" className="font-semibold text-[var(--brand-deep)]">
          Log in
        </Link>
      </p>
    </form>
  );
}