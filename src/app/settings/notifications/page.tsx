import type { Metadata } from "next";

import NotificationPreferences from "@/features/notification-preferences/components/NotificationPreferences";

export const metadata: Metadata = {
  title: "Notification Preferences | Schedula",
};

export default function NotificationPreferencesPage() {
  return (
    <main className="bg-[var(--canvas)]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
        <NotificationPreferences />
      </div>
    </main>
  );
}