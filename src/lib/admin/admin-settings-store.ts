import { getSharedSingleton, setSharedSingleton } from "@/lib/redux-data";

export type AdminNotificationPreferences = {
  loginAlerts: boolean;
  approvalUpdates: boolean;
  systemUpdates: boolean;
};

export type PlatformSettings = {
  platformName: string;
  supportEmail: string;
  maintenanceMode: boolean;
};

type AdminPreferencesById = Record<string, AdminNotificationPreferences>;

export const DEFAULT_ADMIN_NOTIFICATION_PREFERENCES: AdminNotificationPreferences = {
  loginAlerts: true,
  approvalUpdates: true,
  systemUpdates: false,
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: "Schedula",
  supportEmail: "support@schedula.com",
  maintenanceMode: false,
};

export function getAdminNotificationPreferences(
  adminId: string,
): AdminNotificationPreferences {
  const saved = getSharedSingleton<AdminPreferencesById>(
    "adminNotificationPreferences",
  );

  return saved?.[adminId] ?? { ...DEFAULT_ADMIN_NOTIFICATION_PREFERENCES };
}

export function saveAdminNotificationPreferences(
  adminId: string,
  preferences: AdminNotificationPreferences,
): void {
  const saved = getSharedSingleton<AdminPreferencesById>(
    "adminNotificationPreferences",
  );

  setSharedSingleton("adminNotificationPreferences", {
    ...saved,
    [adminId]: preferences,
  });
}

export function getPlatformSettings(): PlatformSettings {
  return getSharedSingleton<PlatformSettings>("platformSettings") ?? {
    ...DEFAULT_PLATFORM_SETTINGS,
  };
}

export function savePlatformSettings(settings: PlatformSettings): void {
  setSharedSingleton("platformSettings", settings);
}
