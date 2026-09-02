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
      const session =
        getSession();

      if (
        !session ||
        session.role !== "doctor"
      ) {
        setStatus(
          "unauthorized",
        );

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

      setDoctorId(
        session.id,
      );

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
    }, [
      prescriptions,
    ]);

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
    if (
      !selectedAppointment
    ) {
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

    updatedAt:
        now,
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

  if (
    status === "loading"
  ) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading prescriptions…
      </div>
    );
  }

  if (
    status === "unauthorized"
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Doctor access required
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Please log in with your doctor
          account to manage
          prescriptions.
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Prescriptions
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Create and manage prescriptions
            for completed appointments.
          </p>
        </div>

        <Link href="/doctor/appointments">
          <Button variant="outline">
            View appointments
          </Button>
        </Link>
      </div>

      {success && (
        <div className="mt-6 rounded-xl bg-[var(--success-soft)] px-4 py-3 text-sm font-medium text-[var(--success)]">
          {success}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        <section>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <h2 className="font-semibold text-[var(--ink)]">
                Completed appointments
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Select an appointment to
                create or edit its
                prescription.
              </p>
            </div>

            <div className="divide-y divide-[var(--line)]">
              {appointments.length ===
              0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-[var(--muted)]">
                    No completed appointments
                    available yet.
                  </p>
                </div>
              ) : (
                appointments.map(
                  (appointment) => {
                    const prescription =
                      appointmentPrescriptionMap.get(
                        appointment.id,
                      );

                    return (
                      <div
                        key={
                          appointment.id
                        }
                        className="px-5 py-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-[var(--ink)]">
                              {
                                appointment.patientName
                              }
                            </p>

                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {
                                appointment.date
                              }{" "}
                              · {
                                appointment.time
                              }
                            </p>

                            {prescription && (
                              <p className="mt-2 text-xs font-medium text-[var(--success)]">
                                Prescription available
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
                              ? "Edit"
                              : "Create"}
                          </Button>
                        </div>
                      </div>
                    );
                  },
                )
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <h2 className="font-semibold text-[var(--ink)]">
                All prescriptions
              </h2>
            </div>

            {prescriptions.length ===
            0 ? (
              <div className="px-5 py-8 text-sm text-[var(--muted)]">
                No prescriptions created
                yet.
              </div>
            ) : (
              <div className="divide-y divide-[var(--line)]">
                {prescriptions.map(
                  (prescription) => (
                    <div
                      key={
                        prescription.id
                      }
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
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
                            prescription.medicines
                              .length
                          }{" "}
                          medicine
                          {prescription
                            .medicines.length !==
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
                        Edit prescription
                      </Button>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          {!selectedAppointment ? (
            <div className="flex min-h-96 flex-col items-center justify-center text-center">
              <div className="grid size-14 place-items-center rounded-full bg-[var(--brand-soft)] text-xl">
                💊
              </div>

              <h2 className="mt-4 font-semibold text-[var(--ink)]">
                Select a completed appointment
              </h2>

              <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
                Choose a patient from the
                completed appointments list
                to create a prescription.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--brand-deep)]">
                    {editingPrescription
                      ? "Edit prescription"
                      : "New prescription"}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[var(--ink)]">
                    {
                      selectedAppointment.patientName
                    }
                  </h2>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {
                      selectedAppointment.date
                    }{" "}
                    · {
                      selectedAppointment.time
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Close
                </button>
              </div>

              {error && (
                <div className="mt-5 rounded-xl bg-[var(--urgent-soft)] px-4 py-3 text-sm font-medium text-[var(--urgent-deep)]">
                  {error}
                </div>
              )}

              <div className="mt-6">
                <label className="block">
                  <span className="text-sm font-medium text-[var(--ink)]">
                    Diagnosis
                  </span>

                  <textarea
                    rows={3}
                    value={diagnosis}
                    onChange={(event) =>
                      setDiagnosis(
                        event.target.value,
                      )
                    }
                    placeholder="Enter diagnosis"
                    className="mt-2 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
                  />
                </label>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-[var(--ink)]">
                    Medicines
                  </h3>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={
                      addMedicine
                    }
                  >
                    + Add medicine
                  </Button>
                </div>

                <div className="mt-4 space-y-4">
                  {medicines.map(
                    (
                      medicine,
                      index,
                    ) => (
                      <div
                        key={medicine.id}
                        className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-[var(--ink)]">
                            Medicine{" "}
                            {index + 1}
                          </p>

                          {medicines.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeMedicine(
                                  medicine.id,
                                )
                              }
                              className="text-xs font-semibold text-[var(--urgent-deep)]"
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
                            placeholder="Example: 500 mg"
                            value={
                              medicine.dosage
                            }
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
                            placeholder="Example: 5 days"
                            value={
                              medicine.duration
                            }
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
                            placeholder="Example: After meals"
                            value={
                              medicine.instructions
                            }
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

              <div className="mt-6">
                <label className="block">
                  <span className="text-sm font-medium text-[var(--ink)]">
                    Additional instructions
                  </span>

                  <textarea
                    rows={4}
                    value={instructions}
                    onChange={(event) =>
                      setInstructions(
                        event.target.value,
                      )
                    }
                    placeholder="Enter any additional instructions for the patient"
                    className="mt-2 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-[var(--line)] pt-5">
                <Button
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>

                <Button
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
      <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
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
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
      />
    </label>
  );
}