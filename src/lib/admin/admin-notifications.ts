import { createNotification, getAllNotifications } from "@/lib/notifications-store";
import { isNotificationPreferenceEnabled } from "@/lib/notification-preferences-store";
import { getAllDoctors } from "@/lib/doctors-store";
import { getAllPatientAccounts } from "@/lib/admin/admin-patients-store";

import type { AppNotification, NotificationRecipientRole } from "@/types/notification";

export type RecipientOption = {
  id: string;
  name: string;
  role: NotificationRecipientRole;
};

export function getAllRecipientOptions(): RecipientOption[] {
  const doctors: RecipientOption[] = getAllDoctors().map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    role: "doctor",
  }));

  const patients: RecipientOption[] = getAllPatientAccounts().map((patient) => ({
    id: patient.id,
    name: patient.name,
    role: "patient",
  }));

  return [...doctors, ...patients];
}

/**
 * AppNotification only stores userId + recipientRole, no display name —
 * resolved here the same way other admin screens join ids to names,
 * rather than adding a redundant name field to every notification.
 */
export function getRecipientName(
  userId: string,
  role: NotificationRecipientRole,
): string {
  if (role === "doctor") {
    return getAllDoctors().find((doctor) => doctor.id === userId)?.name ?? "Unknown doctor";
  }

  return (
    getAllPatientAccounts().find((patient) => patient.id === userId)?.name ??
    "Unknown patient"
  );
}

export function getAllNotificationsForAdmin(): AppNotification[] {
  return [...getAllNotifications()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export type SendNotificationResult = {
  sentCount: number;
  skippedCount: number;
};

/**
 * Fans out one createNotification() call per recipient — that's how
 * every other notification in the app is modeled (one record per
 * user), so a "broadcast" here is really N individual sends, same
 * shape as everything else in the Notifications screen. Uses type
 * "system", the same type already used for the one existing
 * admin-adjacent broadcast (waitlist-store.ts's "slot available"
 * message) rather than inventing a new NotificationType.
 * createNotification() silently skips a recipient who has disabled
 * "system" notifications in their own preferences (respecting their
 * choice) — skippedCount reflects that so the admin isn't told
 * "sent" when it wasn't.
 */
export function sendAdminNotification({
  title,
  message,
  recipients,
}: {
  title: string;
  message: string;
  recipients: RecipientOption[];
}): SendNotificationResult {
  let sentCount = 0;
  let skippedCount = 0;

  recipients.forEach((recipient) => {
    const willSend = isNotificationPreferenceEnabled(recipient.id, "system");

    createNotification({
      userId: recipient.id,
      recipientRole: recipient.role,
      title,
      message,
      type: "system",
    });

    if (willSend) {
      sentCount += 1;
    } else {
      skippedCount += 1;
    }
  });

  return { sentCount, skippedCount };
}
