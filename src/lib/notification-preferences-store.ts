import type {
  NotificationPreferences,
  NotificationPreferenceKey,
} from "@/types/notification-preferences";

import type {
  NotificationType,
} from "@/types/notification";

const KEY =
  "schedula:notification-preferences";

const NOTIFICATION_PREFERENCE_KEYS: NotificationPreferenceKey[] =
  [
    "appointment",
    "confirmation",
    "cancellation",
    "reschedule",
    "declined",
    "missed",
    "prescription",
    "system",
  ];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isNotificationPreferenceKey(
  value: unknown,
): value is NotificationPreferenceKey {
  return NOTIFICATION_PREFERENCE_KEYS.includes(
    value as NotificationPreferenceKey,
  );
}

function createDefaultPreferences(
  userId: string,
): NotificationPreferences {
  return {
    userId,

    appointment: true,
    confirmation: true,
    cancellation: true,
    reschedule: true,
    declined: true,
    missed: true,
    prescription: true,
    system: true,

    updatedAt:
      new Date().toISOString(),
  };
}

function normalizePreferences(
  value: unknown,
  userId: string,
): NotificationPreferences {
  const defaults =
    createDefaultPreferences(
      userId,
    );

  if (
    !value ||
    typeof value !== "object"
  ) {
    return defaults;
  }

  const source =
    value as Record<
      string,
      unknown
    >;

  const preferences: NotificationPreferences =
    {
      ...defaults,
      userId,
      updatedAt:
        typeof source.updatedAt ===
        "string"
          ? source.updatedAt
          : defaults.updatedAt,
    };

  NOTIFICATION_PREFERENCE_KEYS.forEach(
    (key) => {
      if (
        typeof source[key] ===
        "boolean"
      ) {
        preferences[key] =
          source[key];
      }
    },
  );

  return preferences;
}

function readPreferences(): NotificationPreferences[] {
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
      JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
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
      .map((item) => {
        const userId =
          typeof item.userId ===
          "string"
            ? item.userId
            : "";

        return normalizePreferences(
          item,
          userId,
        );
      })
      .filter(
        (item) =>
          item.userId.length > 0,
      );
  } catch {
    return [];
  }
}

function writePreferences(
  preferences: NotificationPreferences[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    KEY,
    JSON.stringify(
      preferences,
    ),
  );

  window.dispatchEvent(
    new Event(
      "schedula:notification-preferences-updated",
    ),
  );
}

export function getNotificationPreferences(
  userId: string,
): NotificationPreferences {
  const existing =
    readPreferences().find(
      (item) =>
        item.userId === userId,
    );

  if (existing) {
    return existing;
  }

  return createDefaultPreferences(
    userId,
  );
}

export function saveNotificationPreferences(
  preferences: NotificationPreferences,
): NotificationPreferences {
  if (!preferences.userId) {
    return preferences;
  }

  const updatedPreferences =
    normalizePreferences(
      preferences,
      preferences.userId,
    );

  updatedPreferences.updatedAt =
    new Date().toISOString();

  const preferencesList =
    readPreferences();

  const exists =
    preferencesList.some(
      (item) =>
        item.userId ===
        preferences.userId,
    );

  const updated = exists
    ? preferencesList.map(
        (item) =>
          item.userId ===
          preferences.userId
            ? updatedPreferences
            : item,
      )
    : [
        ...preferencesList,
        updatedPreferences,
      ];

  writePreferences(
    updated,
  );

  return updatedPreferences;
}

export function updateNotificationPreference(
  userId: string,
  key: NotificationPreferenceKey,
  enabled: boolean,
): NotificationPreferences {
  const current =
    getNotificationPreferences(
      userId,
    );

  return saveNotificationPreferences(
    {
      ...current,
      [key]: enabled,
    },
  );
}

export function setNotificationPreference(
  userId: string,
  type: NotificationType,
  enabled: boolean,
): NotificationPreferences {
  if (
    !isNotificationPreferenceKey(
      type,
    )
  ) {
    return getNotificationPreferences(
      userId,
    );
  }

  return updateNotificationPreference(
    userId,
    type,
    enabled,
  );
}

export function isNotificationPreferenceEnabled(
  userId: string,
  type: NotificationType,
): boolean {
  const preferences =
    getNotificationPreferences(
      userId,
    );

  return preferences[type];
}

export function resetNotificationPreferences(
  userId: string,
): NotificationPreferences {
  return saveNotificationPreferences(
    createDefaultPreferences(
      userId,
    ),
  );
}

export function deleteNotificationPreferences(
  userId: string,
): void {
  if (!isBrowser()) {
    return;
  }

  const updated =
    readPreferences().filter(
      (item) =>
        item.userId !== userId,
    );

  writePreferences(updated);
}