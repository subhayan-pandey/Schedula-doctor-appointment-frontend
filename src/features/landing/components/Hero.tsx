"use client";

import {
  useRouter,
} from "next/navigation";
import {
  useState,
  type FormEvent,
} from "react";

import Button from "@/components/ui/Button";

export default function Hero() {
  const router =
    useRouter();

  const [query, setQuery] =
    useState("");

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedQuery =
      query.trim();

    const params = trimmedQuery
      ? `?query=${encodeURIComponent(
          trimmedQuery,
        )}`
      : "";

    router.push(
      `/doctors${params}`,
    );
  }

  return (
    <section className="bg-[var(--brand-soft)]">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-18">
        <div>
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-deep)] ring-1 ring-inset ring-[var(--brand)]/20">
            Trusted care, booked simply
          </span>

          <h1 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl sm:leading-[1.08]">
            Find the right doctor and book in minutes
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-lg sm:leading-7">
            Search verified doctors near you, check real availability, and
            confirm your appointment without waiting on a call.
          </p>

          <form
            onSubmit={handleSearch}
            role="search"
            aria-label="Search doctors"
            className="mt-7 rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-[var(--line)]"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center rounded-xl border border-transparent px-3 transition-colors focus-within:border-[var(--brand)]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-[var(--muted)]"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path d="m20 20-4-4" />
                </svg>

                <label
                  htmlFor="doctor-search"
                  className="sr-only"
                >
                  Search by doctor, specialty, or condition
                </label>

                <input
                  id="doctor-search"
                  type="text"
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value,
                    )
                  }
                  placeholder="Search doctor, specialty, or condition"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="sm:min-w-[132px]"
              >
                Search
              </Button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
            <span className="font-medium">
              Popular:
            </span>

            <span>
              Cardiologist
            </span>

            <span aria-hidden="true">
              ·
            </span>

            <span>
              Dermatologist
            </span>

            <span aria-hidden="true">
              ·
            </span>

            <span>
              Pediatrician
            </span>

            <span aria-hidden="true">
              ·
            </span>

            <span>
              General Physician
            </span>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-[var(--muted)]">
                Next available slot
              </p>

              <span className="rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--success)]">
                Available
              </span>
            </div>

            <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
              Today, 10:00 AM – 10:15 AM
            </p>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--brand-soft)] p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-sm font-semibold text-white">
                KD
              </span>

              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--ink)]">
                  Dr. Kumar Das
                </p>

                <p className="mt-0.5 text-sm text-[var(--muted)]">
                  Cardiologist · Dombivali
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--urgent-deep)]">
                  Limited slots today
                </p>

                <p className="mt-0.5 text-xs text-[var(--urgent-deep)]/80">
                  Book before availability changes
                </p>
              </div>

              <span className="text-sm font-semibold text-[var(--urgent-deep)]">
                2 left
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}