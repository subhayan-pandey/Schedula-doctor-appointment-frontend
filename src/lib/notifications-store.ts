import type {
  AppNotification,
  NotificationType,
} from "@/types/notification";

const KEY = "schedula:notifications";

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

    return raw
      ? (JSON.parse(raw) as AppNotification[])
      : [];
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
    new Event("schedula:notifications-updated"),
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

export function createNotification({
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
  const notification: AppNotification = {
    id: `notification-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    userId,
    title,
    message,
    type,
    appointmentId,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  const notifications = [
    notification,
    ...readNotifications(),
  ];

  writeNotifications(notifications);

  return notification;
}

export function markNotificationAsRead(
  notificationId: string,
) {
  const updated =
    readNotifications().map(
      (notification) =>
        notification.id === notificationId
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
) {
  const updated =
    readNotifications().map(
      (notification) =>
        notification.userId === userId
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
    );

  writeNotifications(updated);
}

export function deleteNotification(
  notificationId: string,
) {
  const updated =
    readNotifications().filter(
      (notification) =>
        notification.id !== notificationId,
    );

  writeNotifications(updated);
}

export function getUnreadNotificationCount(
  userId: string,
) {
  return readNotifications().filter(
    (notification) =>
      notification.userId === userId &&
      !notification.isRead,
  ).length;
}