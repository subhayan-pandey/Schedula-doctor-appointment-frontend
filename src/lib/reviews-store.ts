import type { DoctorReview } from "@/types/review";
import { getSharedCollection, updateSharedCollection } from "@/lib/redux-data";
export function getAllReviews(): DoctorReview[] { return getSharedCollection<DoctorReview>("reviews"); }
export function getReviewByAppointmentId(appointmentId: string): DoctorReview | undefined { return getAllReviews().find((item) => item.appointmentId === appointmentId); }
export function saveReview(review: DoctorReview): DoctorReview[] { return updateSharedCollection<DoctorReview>("reviews", (items) => [...items.filter((item) => item.appointmentId !== review.appointmentId), review]); }
