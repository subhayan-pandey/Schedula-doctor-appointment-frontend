import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  getAllNotifications,
  getDoctorNotifications,
  getPatientNotifications,
  getNotificationsByUserAndRole,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
} from "@/lib/notifications-store";

import type {
  AppNotification,
  NotificationRecipientRole,
} from "@/types/notification";

type NotificationsState = {
  notifications: AppNotification[];
  initialized: boolean;
};

const initialState: NotificationsState = {
  notifications: [],
  initialized: false,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,

  reducers: {
    initializeNotifications(
      state,
      action: PayloadAction<{
        userId: string;
        recipientRole: NotificationRecipientRole;
      }>,
    ) {
      const {
        userId,
        recipientRole,
      } = action.payload;

      if (recipientRole === "patient") {
        state.notifications =
          getPatientNotifications(userId);
      } else {
        state.notifications =
          getDoctorNotifications(userId);
      }

      state.initialized = true;
    },

    setNotifications(
      state,
      action: PayloadAction<AppNotification[]>,
    ) {
      state.notifications =
        action.payload;

      state.initialized = true;
    },

    refreshNotifications(
      state,
      action: PayloadAction<{
        userId: string;
        recipientRole: NotificationRecipientRole;
      }>,
    ) {
      const {
        userId,
        recipientRole,
      } = action.payload;

      state.notifications =
        getNotificationsByUserAndRole(
          userId,
          recipientRole,
        );

      state.initialized = true;
    },

    addNotification(
      state,
      action: PayloadAction<AppNotification>,
    ) {
      const exists =
        state.notifications.some(
          (notification) =>
            notification.id ===
            action.payload.id,
        );

      if (exists) {
        return;
      }

      state.notifications.unshift(
        action.payload,
      );
    },

    markAsRead(
      state,
      action: PayloadAction<string>,
    ) {
      markNotificationAsRead(
        action.payload,
      );

      state.notifications =
        state.notifications.map(
          (notification) =>
            notification.id ===
            action.payload
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification,
        );
    },

    markAllAsRead(
      state,
      action: PayloadAction<{
        userId: string;
        recipientRole?: NotificationRecipientRole;
      }>,
    ) {
      const {
        userId,
        recipientRole,
      } = action.payload;

      markAllNotificationsAsRead(
        userId,
        recipientRole,
      );

      state.notifications =
        state.notifications.map(
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
        );
    },

    removeNotification(
      state,
      action: PayloadAction<string>,
    ) {
      deleteNotification(
        action.payload,
      );

      state.notifications =
        state.notifications.filter(
          (notification) =>
            notification.id !==
            action.payload,
        );
    },

    clearNotifications(state) {
      state.notifications = [];
      state.initialized = true;
    },

    syncNotifications(state) {
      state.notifications =
        getAllNotifications();
    },
  },
});

export const {
  initializeNotifications,
  setNotifications,
  refreshNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
  syncNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;