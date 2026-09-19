"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  getAllBookings,
} from "@/lib/bookings-store";

import {
  getAllPrescriptions,
  savePrescription,
} from "@/lib/prescriptions-store";

import {
  getSession,
} from "@/lib/storage";

import type {
  Booking,
} from "@/types/booking";

import type {
  Prescription,
  PrescriptionMedicine,
} from "@/types/prescription";

type PageStatus =
  | "loading"
  | "unauthorized"
  | "ready";

type MedicineDraft = {
  id: string;
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
};

function createMedicine(): MedicineDraft {
  return {
    id: `med-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    name: "",
    dosage: "",
    duration: "",
    instructions: "",
  };
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function formatTime(value: string): string {
  return value;
}

export default function DoctorPrescriptions() {
  const [
    status,
    setStatus,
  ] = useState<PageStatus>("loading");

  const [
    doctorId,
    setDoctorId,
  ] = useState("");

  const [
    appointments,
    setAppointments,
  ] = useState<Booking[]>([]);

  const [
    prescriptions,
    setPrescriptions,
  ] = useState<Prescription[]>([]);

  const [
    selectedAppointment,
    setSelectedAppointment,
  ] = useState<Booking | null>(null);

  const [
    editingPrescription,
    setEditingPrescription,
  ] = useState<Prescription | null>(null);

  const [
    diagnosis,
    setDiagnosis,
  ] = useState("");

  const [
    medicines,
    setMedicines,
  ] = useState<MedicineDraft[]>([
    createMedicine(),
  ]);

  const [
    instructions,
    setInstructions,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState<string | null>(null);

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

      const doctorBookings =
        getAllBookings().filter(
          (booking) =>
            booking.doctorId ===
            session.id,
        );

      const doctorPrescriptions =
        getAllPrescriptions().filter(
          (prescription) =>
            prescription.doctorId ===
            session.id,
        );

      setDoctorId(session.id);

      setAppointments(
        doctorBookings.filter(
          (booking) =>
            booking.status ===
            "completed",
        ),
      );

      setPrescriptions(
        doctorPrescriptions,
      );

      setStatus("ready");
    });
  }, []);

  const appointmentPrescriptionMap =
    useMemo(() => {
      return new Map(
        prescriptions.map(
          (prescription) => [
            prescription.appointmentId,
            prescription,
          ],
        ),
      );
    }, [prescriptions]);

  function resetForm() {
    setSelectedAppointment(null);
    setEditingPrescription(null);
    setDiagnosis("");
    setMedicines([
      createMedicine(),
    ]);
    setInstructions("");
    setError(null);
  }

  function openCreate(
    appointment: Booking,
  ) {
    setSelectedAppointment(
      appointment,
    );

    setEditingPrescription(null);
    setDiagnosis("");

    setMedicines([
      createMedicine(),
    ]);

    setInstructions("");
    setError(null);
    setSuccess(null);
  }

  function openEdit(
    prescription: Prescription,
  ) {
    const appointment =
      appointments.find(
        (item) =>
          item.id ===
          prescription.appointmentId,
      );

    if (!appointment) {
      return;
    }

    setSelectedAppointment(
      appointment,
    );

    setEditingPrescription(
      prescription,
    );

    setDiagnosis(
      prescription.diagnosis,
    );

    setMedicines(
      prescription.medicines.map(
        (medicine) => ({
          id: medicine.id,
          name: medicine.name,
          dosage: medicine.dosage,
          duration:
            medicine.duration,
          instructions:
            medicine.instructions,
        }),
      ),
    );

    setInstructions(
      prescription.instructions,
    );

    setError(null);
    setSuccess(null);
  }

  function updateMedicine(
    medicineId: string,
    field:
      | "name"
      | "dosage"
      | "duration"
      | "instructions",
    value: string,
  ) {
    setMedicines(
      (current) =>
        current.map(
          (medicine) =>
            medicine.id ===
            medicineId
              ? {
                  ...medicine,
                  [field]: value,
                }
              : medicine,
        ),
    );
  }

  function addMedicine() {
    setMedicines(
      (current) => [
        ...current,
        createMedicine(),
      ],
    );
  }

  function removeMedicine(
    medicineId: string,
  ) {
    setMedicines(
      (current) => {
        if (
          current.length === 1
        ) {
          return current;
        }

        return current.filter(
          (medicine) =>
            medicine.id !==
            medicineId,
        );
      },
    );
  }

  function refreshPrescriptions() {
    if (!doctorId) {
      return;
    }

    setPrescriptions(
      getAllPrescriptions().filter(
        (prescription) =>
          prescription.doctorId ===
          doctorId,
      ),
    );
  }

  function handleSave() {
    if (!selectedAppointment) {
      return;
    }

    setError(null);
    setSuccess(null);

    if (
      diagnosis.trim().length === 0
    ) {
      setError(
        "Please enter a diagnosis.",
      );

      return;
    }

    const validMedicines =
      medicines.filter(
        (medicine) =>
          medicine.name.trim() &&
          medicine.dosage.trim() &&
          medicine.duration.trim(),
      );

    if (
      validMedicines.length === 0
    ) {
      setError(
        "Add at least one complete medicine.",
      );

      return;
    }

    if (
      validMedicines.length !==
      medicines.length
    ) {
      setError(
        "Complete all medicine fields or remove incomplete medicines.",
      );

      return;
    }

    const now =
      new Date().toISOString();

    const prescription: Prescription = {
      id:
        editingPrescription?.id ??
        `rx-${Date.now()}`,

      appointmentId:
        selectedAppointment.id,

      doctorId,

      patientId:
        selectedAppointment.patientId,

      patientName:
        selectedAppointment.patientName,

      diagnosis:
        diagnosis.trim(),

      medicines:
        validMedicines.map(
          (
            medicine,
          ): PrescriptionMedicine => ({
            id: medicine.id,
            name:
              medicine.name.trim(),
            dosage:
              medicine.dosage.trim(),
            duration:
              medicine.duration.trim(),
            instructions:
              medicine.instructions.trim(),
          }),
        ),

      instructions:
        instructions.trim(),

      createdAt:
        editingPrescription?.createdAt ??
        now,

      updatedAt: now,
    };

    savePrescription(
      prescription,
    );

    refreshPrescriptions();

    setSuccess(
      editingPrescription
        ? "Prescription updated successfully."
        : "Prescription created successfully.",
    );

    resetForm();
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full border-2 border-[var(--brand-soft)] border-t-[var(--brand)]">
            <span className="sr-only">
              Loading
            </span>
          </div>

          <p className="mt-4 text-sm text-[var(--muted)]">
            Loading prescriptions...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
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
            Please log in with your doctor account to manage prescriptions.
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-6">
        <header>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
                Doctor portal
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
                Prescriptions
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Create and manage prescriptions for your completed patient
                appointments.
              </p>
            </div>

            <Link href="/doctor/appointments">
              <Button
                variant="outline"
                size="sm"
              >
                View appointments
              </Button>
            </Link>
          </div>
        </header>

        {success && (
          <div
            className="rounded-xl border border-[var(--success)]/20 bg-[var(--success-soft)] px-4 py-3 text-sm font-medium text-[var(--success)]"
            role="status"
          >
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              <div className="border-b border-[var(--line)] px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--ink)]">
                      Completed appointments
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      Select an appointment to create or edit its prescription.
                    </p>
                  </div>

                  <span className="rounded-full bg-[var(--canvas)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
                    {appointments.length}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[var(--line)]">
                {appointments.length === 0 ? (
                  <div className="px-5 py-12 text-center sm:px-6">
                    <div className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand-deep)]">
                      RX
                    </div>

                    <p className="mt-4 text-sm font-semibold text-[var(--ink)]">
                      No completed appointments
                    </p>

                    <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[var(--muted)]">
                      Completed appointments will appear here when they are
                      ready for prescription management.
                    </p>
                  </div>
                ) : (
                  appointments.map(
                    (appointment) => {
                      const prescription =
                        appointmentPrescriptionMap.get(
                          appointment.id,
                        );

                      const isSelected =
                        selectedAppointment?.id ===
                        appointment.id;

                      return (
                        <div
                          key={
                            appointment.id
                          }
                          className={`p-4 transition-colors sm:p-5 ${
                            isSelected
                              ? "bg-[var(--brand-soft)]/50"
                              : "hover:bg-[var(--canvas)]"
                          }`}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-[var(--ink)]">
                                  {
                                    appointment.patientName
                                  }
                                </p>

                                {prescription && (
                                  <span className="rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--success)]">
                                    Prescription ready
                                  </span>
                                )}
                              </div>

                              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
                                <span>
                                  {formatDate(
                                    appointment.date,
                                  )}
                                </span>

                                <span
                                  aria-hidden="true"
                                >
                                  •
                                </span>

                                <span>
                                  {formatTime(
                                    appointment.time,
                                  )}
                                </span>
                              </div>

                              {prescription && (
                                <p className="mt-2 text-xs text-[var(--muted)]">
                                  {
                                    prescription.medicines.length
                                  }{" "}
                                  medicine
                                  {prescription.medicines.length !==
                                  1
                                    ? "s"
                                    : ""}{" "}
                                  prescribed
                                </p>
                              )}
                            </div>

                            <Button
                              size="sm"
                              variant={
                                prescription
                                  ? "outline"
                                  : "primary"
                              }
                              onClick={() =>
                                prescription
                                  ? openEdit(
                                      prescription,
                                    )
                                  : openCreate(
                                      appointment,
                                    )
                              }
                            >
                              {prescription
                                ? "Edit prescription"
                                : "Create prescription"}
                            </Button>
                          </div>
                        </div>
                      );
                    },
                  )
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              <div className="border-b border-[var(--line)] px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-base font-semibold text-[var(--ink)]">
                    Prescription history
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    Prescriptions already created for your patients.
                  </p>
                </div>
              </div>

              {prescriptions.length === 0 ? (
                <div className="px-5 py-10 text-center sm:px-6">
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    No prescriptions yet
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Created prescriptions will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {prescriptions.map(
                    (prescription) => (
                      <div
                        key={
                          prescription.id
                        }
                        className="p-4 sm:p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--ink)]">
                              {
                                prescription.patientName
                              }
                            </p>

                            <p className="mt-1 text-sm text-[var(--muted)]">
                              {
                                prescription.diagnosis
                              }
                            </p>

                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {
                                prescription.medicines.length
                              }{" "}
                              medicine
                              {prescription.medicines.length !==
                              1
                                ? "s"
                                : ""}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openEdit(
                                prescription,
                              )
                            }
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
            {!selectedAppointment ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center px-4 py-12 text-center">
                <div className="grid size-16 place-items-center rounded-2xl bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand-deep)]">
                  RX
                </div>

                <h2 className="mt-5 text-lg font-semibold text-[var(--ink)]">
                  Select a completed appointment
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                  Choose a patient from the completed appointments list to
                  create a new prescription or update an existing one.
                </p>

                <div className="mt-6 rounded-xl bg-[var(--canvas)] px-4 py-3 text-xs leading-5 text-[var(--muted)]">
                  Prescription changes are reflected in the patient&apos;s
                  completed appointment.
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
                      {editingPrescription
                        ? "Edit prescription"
                        : "New prescription"}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--ink)]">
                      {
                        selectedAppointment.patientName
                      }
                    </h2>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
                      <span>
                        {formatDate(
                          selectedAppointment.date,
                        )}
                      </span>

                      <span
                        aria-hidden="true"
                      >
                        •
                      </span>

                      <span>
                        {formatTime(
                          selectedAppointment.time,
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                  >
                    Close
                  </button>
                </div>

                {error && (
                  <div
                    className="mt-5 rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-4 py-3 text-sm font-medium leading-5 text-[var(--urgent-deep)]"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <div className="mt-6">
                  <label
                    htmlFor="prescription-diagnosis"
                    className="block"
                  >
                    <span className="text-sm font-semibold text-[var(--ink)]">
                      Diagnosis
                    </span>

                    <span className="mt-1 block text-xs text-[var(--muted)]">
                      Record the diagnosis associated with this appointment.
                    </span>

                    <textarea
                      id="prescription-diagnosis"
                      rows={3}
                      value={diagnosis}
                      onChange={(event) =>
                        setDiagnosis(
                          event.target.value,
                        )
                      }
                      placeholder="Enter diagnosis"
                      className="mt-3 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-sm leading-6 text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
                    />
                  </label>
                </div>

                <div className="mt-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--ink)]">
                        Medicines
                      </h3>

                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Add the prescribed medicines and usage details.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addMedicine}
                    >
                      Add medicine
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {medicines.map(
                      (
                        medicine,
                        index,
                      ) => (
                        <div
                          key={
                            medicine.id
                          }
                          className="rounded-2xl border border-[var(--line)] bg-[var(--canvas)] p-4 sm:p-5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="grid size-7 place-items-center rounded-lg bg-[var(--surface)] text-xs font-semibold text-[var(--brand-deep)]">
                                {index + 1}
                              </span>

                              <p className="text-sm font-semibold text-[var(--ink)]">
                                Medicine {index + 1}
                              </p>
                            </div>

                            {medicines.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeMedicine(
                                    medicine.id,
                                  )
                                }
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--urgent-deep)] hover:bg-[var(--urgent-soft)]"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <InputField
                              label="Medicine name"
                              value={
                                medicine.name
                              }
                              placeholder="Example: Paracetamol"
                              onChange={(
                                value,
                              ) =>
                                updateMedicine(
                                  medicine.id,
                                  "name",
                                  value,
                                )
                              }
                            />

                            <InputField
                              label="Dosage"
                              value={
                                medicine.dosage
                              }
                              placeholder="Example: 500 mg"
                              onChange={(
                                value,
                              ) =>
                                updateMedicine(
                                  medicine.id,
                                  "dosage",
                                  value,
                                )
                              }
                            />

                            <InputField
                              label="Duration"
                              value={
                                medicine.duration
                              }
                              placeholder="Example: 5 days"
                              onChange={(
                                value,
                              ) =>
                                updateMedicine(
                                  medicine.id,
                                  "duration",
                                  value,
                                )
                              }
                            />

                            <InputField
                              label="Instructions"
                              value={
                                medicine.instructions
                              }
                              placeholder="Example: After meals"
                              onChange={(
                                value,
                              ) =>
                                updateMedicine(
                                  medicine.id,
                                  "instructions",
                                  value,
                                )
                              }
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="mt-7">
                  <label
                    htmlFor="prescription-instructions"
                    className="block"
                  >
                    <span className="text-sm font-semibold text-[var(--ink)]">
                      Additional instructions
                    </span>

                    <span className="mt-1 block text-xs text-[var(--muted)]">
                      Add any additional guidance the patient should follow.
                    </span>

                    <textarea
                      id="prescription-instructions"
                      rows={4}
                      value={instructions}
                      onChange={(event) =>
                        setInstructions(
                          event.target.value,
                        )
                      }
                      placeholder="Enter additional instructions for the patient"
                      className="mt-3 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-sm leading-6 text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
                    />
                  </label>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-2.5 border-t border-[var(--line)] pt-5 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSave}
                  >
                    {editingPrescription
                      ? "Save changes"
                      : "Create prescription"}
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
        {label}
      </span>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
      />
    </label>
  );
}