export type NotificationRecipientRole =
  | "patient"
  | "doctor";

export type NotificationType =
  | "appointment"
  | "confirmation"
  | "cancellation"
  | "prescription"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  recipientRole: NotificationRecipientRole;
  title: string;
  message: string;
  type: NotificationType;
  appointmentId?: string;
  isRead: boolean;
  createdAt: string;
}