import { getAllReviews, saveReview } from "@/lib/reviews-store";
import { getBookingById } from "@/lib/bookings-store";
import { getDoctorById } from "@/lib/doctors-store";

import type { DoctorReview } from "@/types/review";

export type AdminReviewView = DoctorReview & {
  reported: boolean;
  hidden: boolean;
  doctorName: string;
  patientName: string;
};

/**
 * DoctorReview only stores doctorId + appointmentId — no patient
 * reference or display name. Patient name is resolved via the linked
 * booking (getBookingById(appointmentId)), same join every other
 * admin screen uses rather than duplicating patient data onto the
 * review itself.
 */
function normalizeReviewForAdmin(review: DoctorReview): AdminReviewView {
  const booking = getBookingById(review.appointmentId);

  return {
    ...review,
    reported: review.reported ?? false,
    hidden: review.hidden ?? false,
    doctorName: getDoctorById(review.doctorId)?.name ?? "Unknown doctor",
    patientName: booking?.patientName ?? "Unknown patient",
  };
}

export function getAllReviewsForAdmin(): AdminReviewView[] {
  return getAllReviews().map(normalizeReviewForAdmin);
}

function updateReviewFields(
  id: string,
  patch: Partial<DoctorReview>,
): AdminReviewView | null {
  const review = getAllReviews().find((candidate) => candidate.id === id);

  if (!review) {
    return null;
  }

  const updated: DoctorReview = { ...review, ...patch };

  saveReview(updated);

  return normalizeReviewForAdmin(updated);
}

/**
 * No patient/doctor-facing "report this review" affordance exists
 * anywhere in the app (reviews aren't even displayed as a list outside
 * this Admin Portal — only the aggregate doctor.reviewsCount number
 * is shown publicly). So, same call as Phase 2B's "Reset to pending
 * (demo)" resubmit stand-in, this lets an admin mark/unmark a review
 * as reported directly, so the reported-review workflow can be
 * exercised without that patient-facing mechanism existing yet.
 */
export function setReviewReported(
  id: string,
  reported: boolean,
): AdminReviewView | null {
  return updateReviewFields(id, { reported });
}

/**
 * "Hide/remove" is implemented as a reversible hide (hidden: true),
 * not a permanent delete — safer default for user-generated content,
 * and the task doc lists "hide" first.
 */
export function setReviewHidden(
  id: string,
  hidden: boolean,
): AdminReviewView | null {
  return updateReviewFields(id, { hidden });
}
