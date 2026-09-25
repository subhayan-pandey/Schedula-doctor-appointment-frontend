import type {
  AppNotification,
  NotificationRecipientRole,
  NotificationType,
} from "@/types/notification";

import {
  store,
} from "@/store";

import {
  setAppointments,
} from "@/store/slices/appointmentsSlice";

import {
  loadPersistedBookings,
} from "@/store/persistence";

import {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  setNotifications,
} from "@/store/slices/notificationsSlice";

import {
  loadPersistedNotifications,
} from "@/store/persistence";

import {
  isNotificationPreferenceEnabled,
} from "@/lib/notification-preferences-store";

function ensureHydrated(): void {
  if (!store.getState().notifications.initialized) {
    store.dispatch(
      setNotifications(
        loadPersistedNotifications(),
      ),
    );
  }

  if (!store.getState().appointments.initialized) {
    store.dispatch(
      setAppointments(
        loadPersistedBookings(),
      ),
    );
  }
}

function getAppointmentStart(
  date: string,
  time: string,
): Date | null {
  const firstTime =
    time.split("-")[0]?.trim();

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

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (
    hours < 1 ||
    hours > 12 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  const result = new Date(
    `${date}T${String(hours).padStart(2, "0")}:${String(
      minutes,
    ).padStart(2, "0")}:00`,
  );

  return Number.isNaN(result.getTime())
    ? null
    : result;
}

export function getAllNotifications(): AppNotification[] {
  ensureHydrated();
  return store.getState().notifications.notifications;
}

export function getNotificationsByUserAndRole(
  userId: string,
  recipientRole: NotificationRecipientRole,
): AppNotification[] {
  return getAllNotifications()
    .filter(
      (notification) =>
        notification.userId === userId &&
        notification.recipientRole === recipientRole,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
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
  ensureHydrated();

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
    createdAt: new Date().toISOString(),
  };

  if (
    !isNotificationPreferenceEnabled(
      userId,
      type,
    )
  ) {
    return notification;
  }

  store.dispatch(
    addNotification(notification),
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
    getAllNotifications().some(
      (notification) =>
        notification.userId === userId &&
        notification.recipientRole === recipientRole &&
        notification.appointmentId === appointmentId &&
        notification.type === type &&
        notification.title === title,
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

function ensureAppointmentReminder(
  patientId: string,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const now = Date.now();
  const twentyFourHours =
    24 * 60 * 60 * 1000;

  const candidate =
    store
      .getState()
      .appointments
      .appointments
      .filter(
        (booking) =>
          booking.patientId === patientId &&
          booking.status === "upcoming",
      )
      .map((booking) => ({
        booking,
        start: getAppointmentStart(
          booking.date,
          booking.time,
        ),
      }))
      .filter(
        (item) =>
          item.start !== null &&
          item.start.getTime() > now &&
          item.start.getTime() - now <= twentyFourHours,
      )
      .sort(
        (a, b) =>
          a.start!.getTime() -
          b.start!.getTime(),
      )[0];

  if (!candidate) {
    return;
  }

  const hoursRemaining = Math.max(
    1,
    Math.ceil(
      (candidate.start!.getTime() - now) /
        (60 * 60 * 1000),
    ),
  );

  createNotificationOnce({
    userId: patientId,
    recipientRole: "patient",
    title: "Appointment reminder",
    message: `Your appointment is scheduled for ${candidate.booking.date} at ${candidate.booking.time}. It starts in approximately ${hoursRemaining} hour${
      hoursRemaining === 1 ? "" : "s"
    }.`,
    type: "appointment",
    appointmentId: candidate.booking.id,
  });
}

export function getPatientNotifications(
  patientId: string,
): AppNotification[] {
  ensureHydrated();
  ensureAppointmentReminder(patientId);

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

export function markNotificationAsRead(
  notificationId: string,
): void {
  ensureHydrated();
  store.dispatch(
    markAsRead(notificationId),
  );
}

export function markAllNotificationsAsRead(
  userId: string,
  recipientRole?: NotificationRecipientRole,
): void {
  ensureHydrated();
  store.dispatch(
    markAllAsRead({
      userId,
      recipientRole,
    }),
  );
}

export function deleteNotification(
  notificationId: string,
): void {
  ensureHydrated();
  store.dispatch(
    removeNotification(notificationId),
  );
}

export function getUnreadNotificationCount(
  userId: string,
  recipientRole?: NotificationRecipientRole,
): number {
  if (recipientRole === "patient") {
    ensureAppointmentReminder(userId);
  }

  return getAllNotifications().filter(
    (notification) => {
      const sameUser =
        notification.userId === userId;
      const sameRole = recipientRole
        ? notification.recipientRole === recipientRole
        : true;

      return (
        sameUser &&
        sameRole &&
        !notification.isRead
      );
    },
  ).length;
}
