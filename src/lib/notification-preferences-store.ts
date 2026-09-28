import type { NotificationPreferences, NotificationPreferenceKey } from "@/types/notification-preferences";
import type { NotificationType } from "@/types/notification";
import { getSharedCollection, updateSharedCollection, emitLegacyViewEvent } from "@/lib/redux-data";
const keys: NotificationPreferenceKey[] = ["appointment", "confirmation", "cancellation", "reschedule", "declined", "missed", "prescription", "system"];
function defaults(userId: string): NotificationPreferences { return { userId, appointment: true, confirmation: true, cancellation: true, reschedule: true, declined: true, missed: true, prescription: true, system: true, updatedAt: new Date().toISOString() }; }
export function getNotificationPreferences(userId: string): NotificationPreferences { return getSharedCollection<NotificationPreferences>("notificationPreferences").find((item) => item.userId === userId) ?? defaults(userId); }
export function saveNotificationPreferences(value: NotificationPreferences): NotificationPreferences {
  if (!value.userId) return value;
  const next = { ...defaults(value.userId), ...value, updatedAt: new Date().toISOString() };
  updateSharedCollection<NotificationPreferences>("notificationPreferences", (items) => items.some((item) => item.userId === value.userId) ? items.map((item) => item.userId === value.userId ? next : item) : [...items, next]);
  emitLegacyViewEvent("schedula:notification-preferences-updated"); return next;
}
export function updateNotificationPreference(userId: string, key: NotificationPreferenceKey, enabled: boolean): NotificationPreferences { return saveNotificationPreferences({ ...getNotificationPreferences(userId), [key]: enabled }); }
export function setNotificationPreference(userId: string, type: NotificationType, enabled: boolean): NotificationPreferences { return keys.includes(type as NotificationPreferenceKey) ? updateNotificationPreference(userId, type as NotificationPreferenceKey, enabled) : getNotificationPreferences(userId); }
export function isNotificationPreferenceEnabled(userId: string, type: NotificationType): boolean { const prefs = getNotificationPreferences(userId); return type === "payment" || type === "refund" ? prefs.system : Boolean(prefs[type as NotificationPreferenceKey]); }
export function resetNotificationPreferences(userId: string): NotificationPreferences { return saveNotificationPreferences(defaults(userId)); }
export function deleteNotificationPreferences(userId: string): void { updateSharedCollection<NotificationPreferences>("notificationPreferences", (items) => items.filter((item) => item.userId !== userId)); emitLegacyViewEvent("schedula:notification-preferences-updated"); }
