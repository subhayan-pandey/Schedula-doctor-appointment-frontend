import type { NotificationType } from "@/types/notification";

export type NotificationPreferenceKey =
  | "appointment"
  | "confirmation"
  | "cancellation"
  | "reschedule"
  | "declined"
  | "missed"
  | "prescription"
  | "system";

export type NotificationPreferences = {
  userId: string;

  appointment: boolean;
  confirmation: boolean;
  cancellation: boolean;
  reschedule: boolean;
  declined: boolean;
  missed: boolean;
  prescription: boolean;
  system: boolean;

  updatedAt: string;
};

export function isNotificationEnabled(
  preferences: NotificationPreferences,
  type: NotificationType,
): boolean {
  return preferences[type];
}