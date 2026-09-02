export type NotificationType =
  | "appointment"
  | "confirmation"
  | "cancellation"
  | "prescription"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  appointmentId?: string;
  isRead: boolean;
  createdAt: string;
}