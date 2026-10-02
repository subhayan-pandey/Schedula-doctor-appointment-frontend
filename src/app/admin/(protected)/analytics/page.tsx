import type { Metadata } from "next";

import AdminAnalytics from "@/features/admin-analytics/components/AdminAnalytics";

export const metadata: Metadata = {
  title: "Analytics | Schedula Admin",
};

export default function AdminAnalyticsPage() {
  return <AdminAnalytics />;
}
