import type { Metadata } from "next";

import GlobalSearch from "@/features/search/components/GlobalSearch";

export const metadata: Metadata = {
  title: "Search | Schedula",
};

export default function SearchPage() {
  return (
    <main className="bg-[var(--canvas)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
        <GlobalSearch />
      </div>
    </main>
  );
}