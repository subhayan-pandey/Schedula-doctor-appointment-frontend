import type { DoctorReview } from "@/types/review";

const KEY = "schedula:doctor-reviews";

function isBrowser() {
  return typeof window !== "undefined";
}

function readReviews(): DoctorReview[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(KEY);

    return raw
      ? (JSON.parse(raw) as DoctorReview[])
      : [];
  } catch {
    return [];
  }
}

function writeReviews(
  reviews: DoctorReview[],
) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    KEY,
    JSON.stringify(reviews),
  );
}

export function getAllReviews(): DoctorReview[] {
  return readReviews();
}

export function getReviewByAppointmentId(
  appointmentId: string,
): DoctorReview | undefined {
  return readReviews().find(
    (review) =>
      review.appointmentId === appointmentId,
  );
}

export function saveReview(
  review: DoctorReview,
): DoctorReview[] {
  const reviews = readReviews();

  const updated = [
    ...reviews.filter(
      (item) =>
        item.appointmentId !==
        review.appointmentId,
    ),
    review,
  ];

  writeReviews(updated);

  return updated;
}