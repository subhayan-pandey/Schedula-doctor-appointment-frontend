export interface DoctorReview {
  id: string;
  doctorId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  createdAt: string;
  /**
   * Admin Portal fields (Phase 4B). Optional so every existing review
   * object still type-checks unchanged. Missing means false — see
   * src/lib/admin/admin-reviews.ts's normalizeReviewForAdmin().
   * There's no patient/doctor-facing way to report a review yet (no
   * screen even displays review comments outside the Admin Portal),
   * so `reported` is set from the Admin Portal itself for now — see
   * the note in admin-reviews.ts.
   */
  reported?: boolean;
  hidden?: boolean;
}
