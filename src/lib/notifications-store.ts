import type {
  AppNotification,
  NotificationType,
} from "@/types/notification";

import {
  getBookingsByPatientId,
} from "@/lib/bookings-store";

const KEY =
  "schedula:notifications";

export type NotificationRecipientRole =
  | "patient"
  | "doctor";

function isBrowser() {
  return typeof window !==
    "undefined";
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
      JSON.parse(raw) as Array<
        Partial<AppNotification>
      >;

    /*
     * Backward compatibility:
     *
     * Notifications created before
     * recipientRole was introduced
     * are treated as patient
     * notifications.
     */
    return parsed.map(
      (notification) => ({
        ...notification,
        recipientRole:
          notification.recipientRole ??
          "patient",
      }) as AppNotification,
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

export function getAllNotifications(): AppNotification[] {
  return readNotifications();
}

/**
 * Returns notifications for a
 * specific user and role.
 *
 * Role filtering is important
 * because doctor IDs and patient
 * IDs can overlap in the local
 * demo data.
 */
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

/**
 * Backward-compatible patient
 * notification lookup.
 */
export function getNotificationsByUserId(
  userId: string,
): AppNotification[] {
  return getNotificationsByUserAndRole(
    userId,
    "patient",
  );
}

/**
 * Creates a notification with
 * an explicit recipient role.
 */
export function createNotification({
  userId,
  recipientRole,
  title,
  message,
  type,
  appointmentId,
}: {
  userId: string;
  recipientRole: NotificationRecipientRole;
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

  const notifications = [
    notification,
    ...readNotifications(),
  ];

  writeNotifications(
    notifications,
  );

  return notification;
}

/**
 * Convenience helper for patient
 * notifications.
 */
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

/**
 * Convenience helper for doctor
 * notifications.
 */
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

/**
 * Creates a notification only if
 * an equivalent notification does
 * not already exist.
 *
 * Useful for reminders and other
 * lifecycle notifications that may
 * be checked repeatedly.
 */
export function createNotificationOnce({
  userId,
  recipientRole,
  title,
  message,
  type,
  appointmentId,
}: {
  userId: string;
  recipientRole: NotificationRecipientRole;
  title: string;
  message: string;
  type: NotificationType;
  appointmentId?: string;
}): AppNotification | null {
  const notifications =
    readNotifications();

  const alreadyExists =
    notifications.some(
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

  if (alreadyExists) {
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

/**
 * Patient reminder generation.
 *
 * The project uses localStorage
 * rather than a backend scheduler,
 * so the reminder is generated
 * when the patient's notifications
 * are requested.
 */
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

  /*
   * Supports values such as:
   *
   * 09:30 AM
   * 10:00 PM
   *
   * The booking slot's first time
   * represents the appointment start.
   */
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

  const appointment =
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
      appointment.getTime(),
    )
  ) {
    return null;
  }

  return appointment;
}

function ensureAppointmentReminder(
  patientId: string,
): void {
  if (!isBrowser()) {
    return;
  }

  const bookings =
    getBookingsByPatientId(
      patientId,
    );

  const now =
    new Date();

  const twentyFourHours =
    24 * 60 * 60 * 1000;

  const upcomingBooking =
    bookings
      .filter(
        (booking) =>
          booking.status ===
          "upcoming",
      )
      .map((booking) => {
        const start =
          getAppointmentStart(
            booking.date,
            booking.time,
          );

        return {
          booking,
          start,
        };
      })
      .filter(
        (item) =>
          item.start !==
            null &&
          item.start.getTime() >
            now.getTime() &&
          item.start.getTime() -
            now.getTime() <=
            twentyFourHours,
      )
      .sort(
        (a, b) =>
          a.start!.getTime() -
          b.start!.getTime(),
      )[0];

  if (
    !upcomingBooking
  ) {
    return;
  }

  const booking =
    upcomingBooking.booking;

  const start =
    upcomingBooking.start!;

  const hoursRemaining =
    Math.max(
      1,
      Math.ceil(
        (start.getTime() -
          now.getTime()) /
          (60 * 60 * 1000),
      ),
    );

  createNotificationOnce({
    userId: patientId,

    recipientRole:
      "patient",

    title:
      "Appointment reminder",

    message: `Your appointment is scheduled for ${booking.date} at ${booking.time}. It starts in approximately ${hoursRemaining} hour${
      hoursRemaining === 1
        ? ""
        : "s"
    }.`,


    type:
      "appointment",

    appointmentId:
      booking.id,
  });
}

/**
 * Returns patient notifications.
 *
 * Also checks whether a reminder
 * should be generated.
 */
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

/**
 * Returns doctor notifications.
 */
export function getDoctorNotifications(
  doctorId: string,
): AppNotification[] {
  return getNotificationsByUserAndRole(
    doctorId,
    "doctor",
  );
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

  writeNotifications(
    updated,
  );
}

export function markAllNotificationsAsRead(
  userId: string,
  recipientRole?: NotificationRecipientRole,
) {
  const updated =
    readNotifications().map(
      (notification) => {
        const matchesUser =
          notification.userId ===
          userId;

        const matchesRole =
          !recipientRole ||
          notification.recipientRole ===
            recipientRole;

        if (
          matchesUser &&
          matchesRole
        ) {
          return {
            ...notification,
            isRead: true,
          };
        }

        return notification;
      },
    );

  writeNotifications(
    updated,
  );
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

  writeNotifications(
    updated,
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
      const matchesUser =
        notification.userId ===
        userId;

      const matchesRole =
        !recipientRole ||
        notification.recipientRole ===
          recipientRole;

      return (
        matchesUser &&
        matchesRole &&
        !notification.isRead
      );
    },
  ).length;
}