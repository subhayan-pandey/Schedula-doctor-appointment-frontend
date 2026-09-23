import type { Metadata } from "next";

import SupportCenter from "@/features/support/components/SupportCenter";

export const metadata: Metadata = {
  title: "Support Center | Schedula",
};

export default function SupportPage() {
  return (
    <main className="bg-[var(--canvas)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
        <SupportCenter />
      </div>
    </main>
  );
}