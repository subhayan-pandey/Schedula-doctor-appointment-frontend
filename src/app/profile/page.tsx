import type {
  Metadata,
} from "next";

import UserProfileManager from "@/features/user-profile/components/UserProfileManager";

export const metadata: Metadata = {
  title: "My Profile | Schedula",
};

export default function ProfilePage() {
  return <UserProfileManager />;
}