import type {
  Metadata,
} from "next";

import DoctorAnalytics from "@/features/doctor-analytics/components/DoctorAnalytics";

export const metadata: Metadata = {
  title:
    "Analytics | Schedula",
};

export default function DoctorAnalyticsPage() {
  return (
    <DoctorAnalytics />
  );
}