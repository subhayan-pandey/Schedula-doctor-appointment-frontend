import {
  formatCount,
  formatPercent,
} from "@/components/admin/charts/chart-utils";

export type BreakdownItem = {
  id: string;
  label: string;
  value: number;
  color: string;
};

/** Horizontal share-of-total bars. Plain HTML, so it reflows on any width. */
export default function BreakdownBars({ items }: { items: BreakdownItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <ul className="space-y-3.5">
      {items.map((item) => {
        const share = total > 0 ? item.value / total : 0;

        return (
          <li key={item.id}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span
                className={`font-medium ${
                  item.value === 0
                    ? "text-[var(--muted)]"
                    : "text-[var(--ink)]"
                }`}
              >
                {item.label}
              </span>

              <span className="font-semibold text-[var(--ink)]">
                {formatCount(item.value)}

                <span className="ml-1.5 font-normal text-[var(--muted)]">
                  {formatPercent(total > 0 ? share : null)}
                </span>
              </span>
            </div>

            <div
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--canvas)]"
              role="progressbar"
              aria-label={item.label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(share * 100)}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${share * 100}%`,
                  backgroundColor: item.color,
                  minWidth: item.value > 0 ? 4 : 0,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
