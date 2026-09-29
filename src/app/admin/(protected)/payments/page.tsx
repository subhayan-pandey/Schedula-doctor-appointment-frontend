import type { Metadata } from "next";

import AdminPaymentsList from "@/features/admin-payments/components/AdminPaymentsList";

export const metadata: Metadata = {
  title: "Payments | Schedula Admin",
};

export default function AdminPaymentsPage() {
  return <AdminPaymentsList />;
}
