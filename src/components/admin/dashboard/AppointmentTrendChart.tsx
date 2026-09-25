import EmptyState from "@/components/ui/EmptyState";

import type { TrendPoint } from "@/lib/admin/dashboard-metrics";

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function AppointmentTrendChart({
  data,
}: {
  data: TrendPoint[];
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No appointment activity yet"
        description="A trend will appear once appointments are booked."
      />
    );
  }

  const maxCount = Math.max(...data.map((point) => point.count), 1);

  return (
    <div className="space-y-4">
      {data.map((point) => {
        const width = (point.count / maxCount) * 100;

        return (
          <div
            key={point.date}
            className="grid grid-cols-[88px_1fr_28px] items-center gap-3 sm:gap-4"
          >
            <p className="truncate text-xs font-medium text-[var(--muted)]">
              {formatShortDate(point.date)}
            </p>

            <div
              className="h-2.5 overflow-hidden rounded-full bg-[var(--canvas)]"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
                style={{
                  width: `${Math.max(width, point.count > 0 ? 4 : 0)}%`,
                }}
              />
            </div>

            <p className="text-right text-xs font-semibold text-[var(--ink)]">
              {point.count}
            </p>
          </div>
        );
      })}
    </div>
  );
}
