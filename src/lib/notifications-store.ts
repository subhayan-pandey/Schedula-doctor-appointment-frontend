import type {
  AppNotification,
  NotificationRecipientRole,
  NotificationType,
} from "@/types/notification";

const KEY = "schedula:notifications";

export const NOTIFICATIONS_UPDATED_EVENT =
  "schedula:notifications-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function readNotifications(): AppNotification[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    /*
     * Notifications created before role support
     * are treated as patient notifications.
     */
    return parsed
      .map(
        (notification) =>
          ({
            ...notification,
            recipientRole:
              notification.recipientRole ??
              "patient",
          }) as AppNotification,
      )
      .filter(
        (notification) =>
          typeof notification.id ===
            "string" &&
          typeof notification.userId ===
            "string" &&
          typeof notification.title ===
            "string" &&
          typeof notification.message ===
            "string" &&
          typeof notification.type ===
            "string" &&
          typeof notification.isRead ===
            "boolean" &&
          typeof notification.createdAt ===
            "string",
      );
  } catch {
    return [];
  }
}

function writeNotifications(
  notifications: AppNotification[],
) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    KEY,
    JSON.stringify(notifications),
  );

  window.dispatchEvent(
    new Event(
      NOTIFICATIONS_UPDATED_EVENT,
    ),
  );
}

export function getAllNotifications(): AppNotification[] {
  return readNotifications();
}

export function getNotificationsByUserId(
  userId: string,
): AppNotification[] {
  return readNotifications()
    .filter(
      (notification) =>
        notification.userId === userId,
    )
    .sort(
      (a, b) =>
        new Date(
          b.createdAt,
        ).getTime() -
        new Date(
          a.createdAt,
        ).getTime(),
    );
}

export function getNotificationsByUserAndRole(
  userId: string,
  role: NotificationRecipientRole,
): AppNotification[] {
  return readNotifications()
    .filter(
      (notification) =>
        notification.userId === userId &&
        notification.recipientRole === role,
    )
    .sort(
      (a, b) =>
        new Date(
          b.createdAt,
        ).getTime() -
        new Date(
          a.createdAt,
        ).getTime(),
    );
}

export function createNotification({
  userId,
  recipientRole = "patient",
  title,
  message,
  type,
  appointmentId,
}: {
  userId: string;
  recipientRole?: NotificationRecipientRole;
  title: string;
  message: string;
  type: NotificationType;
  appointmentId?: string;
}): AppNotification {
  const notification: AppNotification = {
    id: `notification-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,

    userId,

    recipientRole,

    title,

    message,

    type,

    appointmentId,

    isRead: false,

    createdAt:
      new Date().toISOString(),
  };

  const notifications = [
    notification,
    ...readNotifications(),
  ];

  writeNotifications(
    notifications,
  );

  return notification;
}

export function createPatientNotification({
  userId,
  title,
  message,
  type,
  appointmentId,
}: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  appointmentId?: string;
}): AppNotification {
  return createNotification({
    userId,
    recipientRole: "patient",
    title,
    message,
    type,
    appointmentId,
  });
}

export function createDoctorNotification({
  userId,
  title,
  message,
  type,
  appointmentId,
}: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  appointmentId?: string;
}): AppNotification {
  return createNotification({
    userId,
    recipientRole: "doctor",
    title,
    message,
    type,
    appointmentId,
  });
}

export function markNotificationAsRead(
  notificationId: string,
) {
  const updated =
    readNotifications().map(
      (notification) =>
        notification.id ===
        notificationId
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
    );

  writeNotifications(updated);
}

export function markAllNotificationsAsRead(
  userId: string,
  role?: NotificationRecipientRole,
) {
  const updated =
    readNotifications().map(
      (notification) => {
        const belongsToUser =
          notification.userId === userId;

        const belongsToRole =
          role === undefined ||
          notification.recipientRole ===
            role;

        if (
          belongsToUser &&
          belongsToRole
        ) {
          return {
            ...notification,
            isRead: true,
          };
        }

        return notification;
      },
    );

  writeNotifications(updated);
}

export function deleteNotification(
  notificationId: string,
) {
  const updated =
    readNotifications().filter(
      (notification) =>
        notification.id !==
        notificationId,
    );

  writeNotifications(updated);
}

export function getUnreadNotificationCount(
  userId: string,
  role?: NotificationRecipientRole,
) {
  return readNotifications().filter(
    (notification) => {
      const belongsToUser =
        notification.userId === userId;

      const belongsToRole =
        role === undefined ||
        notification.recipientRole ===
          role;

      return (
        belongsToUser &&
        belongsToRole &&
        !notification.isRead
      );
    },
  ).length;
}