import type { Metadata } from "next";

import AdminReviewsList from "@/features/admin-reviews/components/AdminReviewsList";

export const metadata: Metadata = {
  title: "Reviews | Schedula Admin",
};

export default function AdminReviewsPage() {
  return <AdminReviewsList />;
}
