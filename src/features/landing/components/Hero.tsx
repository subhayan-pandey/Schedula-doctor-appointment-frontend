"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = query.trim() ? `?query=${encodeURIComponent(query.trim())}` : "";
    router.push(`/doctors${params}`);
  }

  return (
    <section className="bg-[var(--brand-soft)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-deep)] ring-1 ring-inset ring-[var(--brand)]/20">
            Trusted care, booked simply
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
            Find the right doctor and book in minutes
          </h1>
          <p className="mt-4 max-w-lg text-[var(--muted)] sm:text-lg">
            Search verified doctors near you, check real availability, and
            confirm your appointment without waiting on a call.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex flex-col gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-[var(--line)] sm:flex-row"
            role="search"
            aria-label="Search doctors"
          >
            <label htmlFor="doctor-search" className="sr-only">
              Search by doctor, specialty, or condition
            </label>
            <input
              id="doctor-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search doctor, specialty, or condition"
              className="flex-1 rounded-lg border border-transparent px-4 py-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
            />
            <Button type="submit" size="lg" className="sm:w-40">
              Search
            </Button>
          </form>

          <p className="mt-3 text-xs text-[var(--muted)]">
            Popular: Cardiologist, Dermatologist, Pediatrician, General Physician
          </p>
        </div>

        <div className="relative hidden lg:block">
          <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[var(--muted)]">Next available slot</p>
            <p className="mt-1 text-lg font-semibold text-[var(--ink)]">Today, 10:00 AM – 10:15 AM</p>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--brand-soft)] p-4">
              <span className="grid size-11 place-items-center rounded-full bg-[var(--brand)] text-sm font-semibold text-white">
                KD
              </span>
              <div>
                <p className="font-semibold text-[var(--ink)]">Dr. Kumar Das</p>
                <p className="text-sm text-[var(--muted)]">Cardiologist · Dombivali</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-4 py-3">
              <p className="text-sm font-medium text-[var(--urgent-deep)]">Limited slots today</p>
              <span className="text-xs font-semibold text-[var(--urgent-deep)]">2 left</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}