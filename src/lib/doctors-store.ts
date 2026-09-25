import type { Doctor } from "@/types/doctor";

import {
  doctors as seedDoctors,
} from "@/lib/mock-data/doctors";

import {
  store,
} from "@/store";

import {
  addDoctorToStore,
  setDoctors,
  updateDoctor,
} from "@/store/slices/doctorsSlice";

import {
  loadPersistedDoctors,
} from "@/store/persistence";

function ensureHydrated(): void {
  if (!store.getState().doctors.initialized) {
    store.dispatch(
      setDoctors(
        loadPersistedDoctors(seedDoctors),
      ),
    );
  }
}

export function getAllDoctors(): Doctor[] {
  ensureHydrated();
  return store.getState().doctors.doctors;
}

export function getDoctorById(
  id: string,
): Doctor | undefined {
  return getAllDoctors().find(
    (doctor) => doctor.id === id,
  );
}

/**
 * Compatibility facade.
 *
 * Doctor runtime state is owned by Redux.
 * This function remains available to existing
 * feature code and routes the mutation into Redux.
 */
export function addDoctor(
  doctor: Doctor,
): void {
  ensureHydrated();

  store.dispatch(
    addDoctorToStore(doctor),
  );
}

/**
 * Admin Portal facade (Phase 2A).
 *
 * Merges `patch` into the doctor and dispatches the same `updateDoctor`
 * reducer addDoctor()/setDoctors() already rely on, so the change is
 * persisted through the existing Redux -> store/persistence.ts path
 * like every other doctor mutation. Returns the updated doctor, or
 * null if no doctor with that id exists.
 */
export function updateDoctorFields(
  id: string,
  patch: Partial<Doctor>,
): Doctor | null {
  const doctor = getDoctorById(id);

  if (!doctor) {
    return null;
  }

  const updated: Doctor = {
    ...doctor,
    ...patch,
  };

  store.dispatch(
    updateDoctor(updated),
  );

  return updated;
}

export function setDoctorActiveStatus(
  id: string,
  isActive: boolean,
): Doctor | null {
  return updateDoctorFields(id, { isActive });
}
