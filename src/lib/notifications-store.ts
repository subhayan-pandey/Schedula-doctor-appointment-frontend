import type {
  AppNotification,
  NotificationRecipientRole,
  NotificationType,
} from "@/types/notification";

import {
  getBookingsByPatientId,
} from "@/lib/bookings-store";

import {
  isNotificationPreferenceEnabled,
} from "@/lib/notification-preferences-store";

const KEY =
  "schedula:notifications";

function isBrowser(): boolean {
  return (
    typeof window !==
    "undefined"
  );
}

function isNotificationType(
  value: unknown,
): value is NotificationType {
  return (
    value === "appointment" ||
    value === "confirmation" ||
    value === "cancellation" ||
    value === "reschedule" ||
    value === "declined" ||
    value === "missed" ||
    value === "prescription" ||
    value === "system"
  );
}

function isRecipientRole(
  value: unknown,
): value is NotificationRecipientRole {
  return (
    value === "patient" ||
    value === "doctor"
  );
}

function readNotifications(): AppNotification[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw,
      ) as unknown;

    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return [];
    }

    return parsed
      .filter(
        (
          item,
        ): item is Record<
          string,
          unknown
        > =>
          Boolean(
            item &&
              typeof item ===
                "object",
          ),
      )
      .map(
        (
          item,
        ): AppNotification => ({
          id:
            typeof item.id ===
            "string"
              ? item.id
              : `notification-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 8)}`,

          userId:
            typeof item.userId ===
            "string"
              ? item.userId
              : "",

          recipientRole:
            isRecipientRole(
              item.recipientRole,
            )
              ? item.recipientRole
              : "patient",

          title:
            typeof item.title ===
            "string"
              ? item.title
              : "Notification",

          message:
            typeof item.message ===
            "string"
              ? item.message
              : "",

          type:
            isNotificationType(
              item.type,
            )
              ? item.type
              : "system",

          appointmentId:
            typeof item.appointmentId ===
            "string"
              ? item.appointmentId
              : undefined,

          isRead:
            item.isRead === true,

          createdAt:
            typeof item.createdAt ===
            "string"
              ? item.createdAt
              : new Date().toISOString(),
        }),
      );
  } catch {
    return [];
  }
}

function writeNotifications(
  notifications: AppNotification[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    KEY,
    JSON.stringify(
      notifications,
    ),
  );

  window.dispatchEvent(
    new Event(
      "schedula:notifications-updated",
    ),
  );
}

/**
 * Persistence adapter.
 *
 * Redux notifications state is the application
 * source of truth. These functions provide persisted
 * notification data for hydration and persistence.
 */
export function getAllNotifications(): AppNotification[] {
  return readNotifications();
}

export function getNotificationsByUserAndRole(
  userId: string,
  recipientRole: NotificationRecipientRole,
): AppNotification[] {
  return readNotifications()
    .filter(
      (notification) =>
        notification.userId ===
          userId &&
        notification.recipientRole ===
          recipientRole,
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

export function getNotificationsByUserId(
  userId: string,
): AppNotification[] {
  return getNotificationsByUserAndRole(
    userId,
    "patient",
  );
}

/**
 * Persistence helper.
 *
 * The notification should also be added to Redux
 * through addNotification for application state.
 */
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
  const notification: AppNotification =
    {
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

  if (
    !isNotificationPreferenceEnabled(
      userId,
      type,
    )
  ) {
    return notification;
  }

  writeNotifications([
    notification,
    ...readNotifications(),
  ]);

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
    recipientRole:
      "patient",
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
    recipientRole:
      "doctor",
    title,
    message,
    type,
    appointmentId,
  });
}

export function createNotificationOnce({
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
}): AppNotification | null {
  const exists =
    readNotifications().some(
      (notification) =>
        notification.userId ===
          userId &&
        notification.recipientRole ===
          recipientRole &&
        notification.appointmentId ===
          appointmentId &&
        notification.type ===
          type &&
        notification.title ===
          title,
    );

  if (exists) {
    return null;
  }

  return createNotification({
    userId,
    recipientRole,
    title,
    message,
    type,
    appointmentId,
  });
}

function getAppointmentStart(
  date: string,
  time: string,
): Date | null {
  const firstTime =
    time
      .split("-")[0]
      ?.trim();

  if (!firstTime) {
    return null;
  }

  const match =
    firstTime.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
    );

  if (!match) {
    return null;
  }

  let hours =
    Number(match[1]);

  const minutes =
    Number(match[2]);

  const meridiem =
    match[3].toUpperCase();

  if (
    hours < 1 ||
    hours > 12 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  if (
    meridiem === "AM" &&
    hours === 12
  ) {
    hours = 0;
  }

  if (
    meridiem === "PM" &&
    hours !== 12
  ) {
    hours += 12;
  }

  const result =
    new Date(
      `${date}T${String(
        hours,
      ).padStart(
        2,
        "0",
      )}:${String(
        minutes,
      ).padStart(
        2,
        "0",
      )}:00`,
    );

  if (
    Number.isNaN(
      result.getTime(),
    )
  ) {
    return null;
  }

  return result;
}

function ensureAppointmentReminder(
  patientId: string,
): void {
  if (!isBrowser()) {
    return;
  }

  const now =
    Date.now();

  const twentyFourHours =
    24 *
    60 *
    60 *
    1000;

  const candidate =
    getBookingsByPatientId(
      patientId,
    )
      .filter(
        (booking) =>
          booking.status ===
          "upcoming",
      )
      .map(
        (booking) => ({
          booking,

          start:
            getAppointmentStart(
              booking.date,
              booking.time,
            ),
        }),
      )
      .filter(
        (item) =>
          item.start !== null &&
          item.start.getTime() >
            now &&
          item.start.getTime() -
            now <=
            twentyFourHours,
      )
      .sort(
        (a, b) =>
          a.start!.getTime() -
          b.start!.getTime(),
      )[0];

  if (!candidate) {
    return;
  }

  const hoursRemaining =
    Math.max(
      1,
      Math.ceil(
        (candidate.start!.getTime() -
          now) /
          (60 *
            60 *
            1000),
      ),
    );

  createNotificationOnce({
    userId:
      patientId,

    recipientRole:
      "patient",

    title:
      "Appointment reminder",

    message: `Your appointment is scheduled for ${candidate.booking.date} at ${candidate.booking.time}. It starts in approximately ${hoursRemaining} hour${
      hoursRemaining === 1
        ? ""
        : "s"
    }.`,

    type:
      "appointment",

    appointmentId:
      candidate.booking.id,
  });
}

export function getPatientNotifications(
  patientId: string,
): AppNotification[] {
  ensureAppointmentReminder(
    patientId,
  );

  return getNotificationsByUserAndRole(
    patientId,
    "patient",
  );
}

export function getDoctorNotifications(
  doctorId: string,
): AppNotification[] {
  return getNotificationsByUserAndRole(
    doctorId,
    "doctor",
  );
}

/**
 * Persistence helper.
 *
 * Redux should be updated through markAsRead
 * before/alongside persistence synchronization.
 */
export function markNotificationAsRead(
  notificationId: string,
): void {
  writeNotifications(
    readNotifications().map(
      (notification) =>
        notification.id ===
        notificationId
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
    ),
  );
}

export function markAllNotificationsAsRead(
  userId: string,
  recipientRole?: NotificationRecipientRole,
): void {
  writeNotifications(
    readNotifications().map(
      (notification) => {
        const sameUser =
          notification.userId ===
          userId;

        const sameRole =
          recipientRole
            ? notification.recipientRole ===
              recipientRole
            : true;

        if (
          sameUser &&
          sameRole
        ) {
          return {
            ...notification,
            isRead: true,
          };
        }

        return notification;
      },
    ),
  );
}

export function deleteNotification(
  notificationId: string,
): void {
  writeNotifications(
    readNotifications().filter(
      (notification) =>
        notification.id !==
        notificationId,
    ),
  );
}

export function getUnreadNotificationCount(
  userId: string,
  recipientRole?: NotificationRecipientRole,
): number {
  if (
    recipientRole ===
    "patient"
  ) {
    ensureAppointmentReminder(
      userId,
    );
  }

  return readNotifications().filter(
    (notification) => {
      const sameUser =
        notification.userId ===
        userId;

      const sameRole =
        recipientRole
          ? notification.recipientRole ===
            recipientRole
          : true;

      return (
        sameUser &&
        sameRole &&
        !notification.isRead
      );
    },
  ).length;
}