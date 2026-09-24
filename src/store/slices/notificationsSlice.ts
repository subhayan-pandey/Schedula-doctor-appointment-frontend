import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

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

const notificationsSlice =
  createSlice({
    name: "notifications",

    initialState,

    reducers: {
      initializeNotifications(
        state,
        action: PayloadAction<{
          userId: string;
          recipientRole: NotificationRecipientRole;
          notifications: AppNotification[];
        }>,
      ) {
        state.notifications =
          action.payload.notifications;

        state.initialized = true;
      },

      setNotifications(
        state,
        action: PayloadAction<
          AppNotification[]
        >,
      ) {
        state.notifications =
          action.payload;

        state.initialized = true;
      },

      refreshNotifications(
        state,
        action: PayloadAction<
          AppNotification[]
        >,
      ) {
        state.notifications =
          action.payload;

        state.initialized = true;
      },

      addNotification(
        state,
        action: PayloadAction<AppNotification>,
      ) {
        const notification =
          action.payload;

        const exists =
          state.notifications.some(
            (item) =>
              item.id ===
              notification.id,
          );

        if (exists) {
          return;
        }

        state.notifications.unshift(
          notification,
        );
      },

      markAsRead(
        state,
        action: PayloadAction<string>,
      ) {
        const notificationId =
          action.payload;

        state.notifications =
          state.notifications.map(
            (notification) =>
              notification.id ===
              notificationId
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
        const notificationId =
          action.payload;

        state.notifications =
          state.notifications.filter(
            (notification) =>
              notification.id !==
              notificationId,
          );
      },

      clearNotifications(
        state,
      ) {
        state.notifications = [];
        state.initialized = true;
      },

      syncNotifications(
        state,
        action: PayloadAction<
          AppNotification[]
        >,
      ) {
        state.notifications =
          action.payload;

        state.initialized = true;
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
} =
  notificationsSlice.actions;

export default notificationsSlice.reducer;