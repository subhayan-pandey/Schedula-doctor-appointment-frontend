import type {
  UserProfile,
} from "@/types/user-profile";

import {
  emptyUserProfile,
} from "@/types/user-profile";

const KEY =
  "schedula:user-profiles";

function isBrowser() {
  return typeof window !==
    "undefined";
}

function readProfiles(): UserProfile[] {
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

    return JSON.parse(
      raw,
    ) as UserProfile[];
  } catch {
    return [];
  }
}

function writeProfiles(
  profiles: UserProfile[],
) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    KEY,
    JSON.stringify(profiles),
  );

  window.dispatchEvent(
    new Event(
      "schedula:user-profile-updated",
    ),
  );
}

export function getUserProfile(
  userId: string,
): UserProfile {
  const profile =
    readProfiles().find(
      (item) =>
        item.userId === userId,
    );

  return (
    profile ??
    emptyUserProfile(userId)
  );
}

export function saveUserProfile(
  profile: UserProfile,
): UserProfile {
  const profiles =
    readProfiles();

  const updatedProfile: UserProfile =
    {
      ...profile,

      updatedAt:
        new Date().toISOString(),
    };

  const exists =
    profiles.some(
      (item) =>
        item.userId ===
        profile.userId,
    );

  const updated = exists
    ? profiles.map((item) =>
        item.userId ===
        profile.userId
          ? updatedProfile
          : item,
      )
    : [
        ...profiles,
        updatedProfile,
      ];

  writeProfiles(updated);

  return updatedProfile;
}