import type { UserProfile } from "@/types/user-profile";
import { emptyUserProfile } from "@/types/user-profile";
import { getSharedCollection, updateSharedCollection, emitLegacyViewEvent } from "@/lib/redux-data";
export function getUserProfile(userId: string): UserProfile { return getSharedCollection<UserProfile>("userProfiles").find((item) => item.userId === userId) ?? emptyUserProfile(userId); }
export function saveUserProfile(profile: UserProfile): UserProfile {
  const updated = { ...profile, updatedAt: new Date().toISOString() };
  updateSharedCollection<UserProfile>("userProfiles", (items) => items.some((item) => item.userId === profile.userId) ? items.map((item) => item.userId === profile.userId ? updated : item) : [...items, updated]);
  emitLegacyViewEvent("schedula:user-profile-updated"); return updated;
}
