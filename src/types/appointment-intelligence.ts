import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

export type AppointmentLifecycleEventType =
  | "created"
  | "confirmed"
  | "upcoming"
  | "rescheduled"
  | "cancelled"
  | "declined"
  | "completed"
  | "missed";

export type AppointmentTimelineEvent = {
  id: string;
  appointmentId: string;
  type: AppointmentLifecycleEventType;
  status?: BookingStatus;
  title: string;
  description?: string;
  timestamp: string;
  reason?: string;
};

export type AppointmentIntelligence = {
  booking: Booking;

  isUpcoming: boolean;
  isActionable: boolean;

  availableActions: Array<
    | "view"
    | "cancel"
    | "reschedule"
    | "rebook"
    | "review"
    | "prescription"
  >;

  timeline: AppointmentTimelineEvent[];
};