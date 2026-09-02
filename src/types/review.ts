export interface DoctorReview {
  id: string;
  doctorId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}