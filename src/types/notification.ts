export type NotificationRecipientRole =
  | "patient"
  | "doctor";

export type NotificationType =
  | "appointment"
  | "confirmation"
  | "cancellation"
  | "reschedule"
  | "declined"
  | "missed"
  | "prescription"
  | "system";

export interface AppNotification {
  id: string;

  /**
   * ID of the user receiving the notification.
   */
  userId: string;

  /**
   * Prevents patient and doctor notifications
   * from being mixed when IDs overlap.
   */
  recipientRole: NotificationRecipientRole;

  title: string;

  message: string;

  type: NotificationType;

  /**
   * Present when the notification relates
   * to a specific appointment.
   */
  appointmentId?: string;

  isRead: boolean;

  createdAt: string;
}