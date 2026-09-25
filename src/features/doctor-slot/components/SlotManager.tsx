"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import AddSlotForm from "@/features/doctor-slot/components/AddSlotForm";
import SlotManagerGrid from "@/features/doctor-slot/components/SlotManagerGrid";

import {
  getSlotsForDoctor,
  createSlot,
  removeSlot,
  toggleSlotAvailability,
} from "@/lib/slots-store";

import { toISODate } from "@/lib/utils/date";

import type { Slot } from "@/types/slot";

import type {
  AppDispatch,
  RootState,
} from "@/store";

import {
  initializeDoctorSlots,
  setDoctorSlots,
  createDoctorSlot,
  removeDoctorSlot,
  toggleDoctorSlotAvailability,
} from "@/store/slices/slotsSlice";

type Status =
  | "loading"
  | "unauthorized"
  | "ready";

function getTodayISO(): string {
  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  return toISODate(
    today,
  );
}

function formatSelectedDate(
  isoDate: string,
): string {
  return new Date(
    `${isoDate}T00:00:00`,
  ).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

export default function SlotManager() {
  const dispatch =
    useDispatch<AppDispatch>();

  const authInitialized =
    useSelector(
      (state: RootState) =>
        state.auth.initialized,
    );

  const authUser =
    useSelector(
      (state: RootState) =>
        state.auth.user,
    );

  const doctorId =
    authUser?.role === "doctor"
      ? authUser.id
      : null;

  const slotsInitialized =
    useSelector(
      (state: RootState) =>
        doctorId
          ? state.slots.initializedDoctors.includes(
              doctorId,
            )
          : false,
    );

  const slots =
    useSelector(
      (state: RootState) =>
        doctorId
          ? state.slots.slotsByDoctor[
              doctorId
            ] ?? []
          : [],
    );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<string>(
    getTodayISO,
  );

  const today = useMemo(
    () => getTodayISO(),
    [],
  );

  useEffect(() => {
    if (
      !authInitialized ||
      !doctorId ||
      slotsInitialized
    ) {
      return;
    }

    dispatch(
      initializeDoctorSlots({
        doctorId,
        slots:
          getSlotsForDoctor(
            doctorId,
          ),
      }),
    );
  }, [
    authInitialized,
    doctorId,
    slotsInitialized,
    dispatch,
  ]);

  useEffect(() => {
    if (
      !authInitialized ||
      !doctorId
    ) {
      return;
    }

    const currentDoctorId =
      doctorId;

    function refreshSlots() {
      dispatch(
        setDoctorSlots({
          doctorId:
            currentDoctorId,
          slots:
            getSlotsForDoctor(
              currentDoctorId,
            ),
        }),
      );
    }

    function handleStorage(
      event: StorageEvent,
    ) {
      if (
        event.key ===
        `schedula:slots:${currentDoctorId}`
      ) {
        refreshSlots();
      }
    }

    function handleSlotsUpdated(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<{
          doctorId?: string;
        }>;

      if (
        customEvent.detail
          ?.doctorId &&
        customEvent.detail
          .doctorId !==
          currentDoctorId
      ) {
        return;
      }

      refreshSlots();
    }

    window.addEventListener(
      "storage",
      handleStorage,
    );

    window.addEventListener(
      "schedula:slots-updated",
      handleSlotsUpdated,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage,
      );

      window.removeEventListener(
        "schedula:slots-updated",
        handleSlotsUpdated,
      );
    };
  }, [
    authInitialized,
    doctorId,
    dispatch,
  ]);

  const slotsForDate =
    useMemo(
      () =>
        slots.filter(
          (slot) =>
            slot.date ===
            selectedDate,
        ),
      [
        slots,
        selectedDate,
      ],
    );

  const morningSlots =
    useMemo(
      () =>
        slotsForDate
          .filter(
            (slot) =>
              slot.period ===
              "Morning",
          )
          .sort((a, b) =>
            a.time.localeCompare(
              b.time,
            ),
          ),
      [slotsForDate],
    );

  const eveningSlots =
    useMemo(
      () =>
        slotsForDate
          .filter(
            (slot) =>
              slot.period ===
              "Evening",
          )
          .sort((a, b) =>
            a.time.localeCompare(
              b.time,
            ),
          ),
      [slotsForDate],
    );

  const availableCount =
    slotsForDate.filter(
      (slot) =>
        slot.status ===
        "available",
    ).length;

  const bookedCount =
    slotsForDate.filter(
      (slot) =>
        slot.status ===
        "booked",
    ).length;

  const unavailableCount =
    slotsForDate.filter(
      (slot) =>
        slot.status ===
        "unavailable",
    ).length;

  const status =
    !authInitialized
      ? "loading"
      : !doctorId
        ? "unauthorized"
        : "ready";

  function handleDateChange(
    value: string,
  ) {
    if (
      !value ||
      value < today
    ) {
      return;
    }

    setSelectedDate(
      value,
    );
  }

  function handleAdd(
    newSlot: {
      time: string;
      period: Slot["period"];
    },
  ) {
    if (!doctorId) {
      return;
    }

    const existingSlots =
      getSlotsForDoctor(
        doctorId,
      );

    const duplicate =
      existingSlots.some(
        (slot) =>
          slot.date ===
            selectedDate &&
          slot.time ===
            newSlot.time,
      );

    if (duplicate) {
      return;
    }

    const updatedSlots =
      createSlot(
        doctorId,
        {
          date:
            selectedDate,
          ...newSlot,
        },
      );

    dispatch(
      setDoctorSlots({
        doctorId,
        slots:
          updatedSlots,
      }),
    );
  }

  function handleToggle(
    slotId: string,
  ) {
    if (!doctorId) {
      return;
    }

    const target =
      slots.find(
        (slot) =>
          slot.id ===
          slotId,
      );

    if (
      !target ||
      target.status ===
        "booked"
    ) {
      return;
    }

    const updatedSlots =
      toggleSlotAvailability(
        doctorId,
        slotId,
      );

    dispatch(
      setDoctorSlots({
        doctorId,
        slots:
          updatedSlots,
      }),
    );

    dispatch(
      toggleDoctorSlotAvailability({
        doctorId,
        slotId,
      }),
    );
  }

  function handleRemove(
    slotId: string,
  ) {
    if (!doctorId) {
      return;
    }

    const target =
      slots.find(
        (slot) =>
          slot.id ===
          slotId,
      );

    if (
      !target ||
      target.status ===
        "booked"
    ) {
      return;
    }

    const updatedSlots =
      removeSlot(
        doctorId,
        slotId,
      );

    dispatch(
      setDoctorSlots({
        doctorId,
        slots:
          updatedSlots,
      }),
    );

    dispatch(
      removeDoctorSlot({
        doctorId,
        slotId,
      }),
    );
  }

  if (
    status ===
    "loading"
  ) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            Loading availability...
          </p>
        </div>
      </div>
    );
  }

  if (
    status ===
    "unauthorized"
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand-deep)]">
            S
          </div>

          <h1 className="mt-4 text-xl font-semibold text-[var(--ink)]">
            Doctor access required
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Log in to manage your appointment availability.
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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-6">
        <header>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
                Doctor portal
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
                Manage availability
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Select any future date to create, disable, or review your
                appointment slots. Booked slots remain reserved and cannot
                be edited here.
              </p>
            </div>

            <Link
              href="/doctor/calendar"
              className="text-sm font-semibold text-[var(--brand-deep)] hover:underline"
            >
              Open calendar
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Selected date
              </p>

              <p className="mt-1 text-base font-semibold text-[var(--ink)]">
                {formatSelectedDate(
                  selectedDate,
                )}
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <label
                htmlFor="doctor-slot-date"
                className="mb-1.5 block text-xs font-semibold text-[var(--muted)]"
              >
                Choose a future date
              </label>

              <input
                id="doctor-slot-date"
                type="date"
                min={today}
                value={
                  selectedDate
                }
                onChange={(
                  event,
                ) =>
                  handleDateChange(
                    event.target
                      .value,
                  )
                }
                className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] sm:w-52"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="rounded-xl bg-[var(--success-soft)] px-3 py-3">
              <p className="text-lg font-semibold text-[var(--success)]">
                {availableCount}
              </p>

              <p className="mt-0.5 text-xs font-medium text-[var(--success)]">
                Available
              </p>
            </div>

            <div className="rounded-xl bg-[var(--brand-soft)] px-3 py-3">
              <p className="text-lg font-semibold text-[var(--brand-deep)]">
                {bookedCount}
              </p>

              <p className="mt-0.5 text-xs font-medium text-[var(--brand-deep)]">
                Booked
              </p>
            </div>

            <div className="rounded-xl bg-stone-100 px-3 py-3">
              <p className="text-lg font-semibold text-[var(--muted)]">
                {unavailableCount}
              </p>

              <p className="mt-0.5 text-xs font-medium text-[var(--muted)]">
                Unavailable
              </p>
            </div>
          </div>
        </section>

        <AddSlotForm
          onAdd={handleAdd}
        />

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="border-b border-[var(--line)] pb-4">
            <p className="text-sm font-semibold text-[var(--ink)]">
              Slots for this date
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              Available slots are offered to patients. Booked slots are
              reserved and temporarily unavailable for new bookings.
            </p>
          </div>

          <div className="mt-5 space-y-7">
            {slotsForDate.length ===
            0 ? (
              <EmptyState
                title="No slots for this date"
                description="Create the first appointment slot for this date using the availability form above."
              />
            ) : (
              <>
                <SlotManagerGrid
                  title="Morning"
                  slots={
                    morningSlots
                  }
                  onToggle={
                    handleToggle
                  }
                  onRemove={
                    handleRemove
                  }
                />

                <SlotManagerGrid
                  title="Evening"
                  slots={
                    eveningSlots
                  }
                  onToggle={
                    handleToggle
                  }
                  onRemove={
                    handleRemove
                  }
                />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}