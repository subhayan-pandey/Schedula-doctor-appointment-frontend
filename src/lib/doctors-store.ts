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
