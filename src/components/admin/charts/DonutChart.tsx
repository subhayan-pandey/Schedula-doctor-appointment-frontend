import {
  formatCount,
  formatPercent,
} from "@/components/admin/charts/chart-utils";

export type DonutSlice = {
  id: string;
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  slices: DonutSlice[];
  ariaLabel: string;
  centerLabel?: string;
};

const SIZE = 168;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({
  slices,
  ariaLabel,
  centerLabel = "Total",
}: DonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const visible = slices.filter((slice) => slice.value > 0);
  const gap = visible.length > 1 ? 2 : 0;

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div
        className="relative shrink-0"
        style={{ width: SIZE, height: SIZE }}
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={ariaLabel}
          className="-rotate-90"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            style={{ stroke: "var(--canvas)" }}
          />

          {total > 0 &&
            visible.map((slice) => {
              const length = (slice.value / total) * CIRCUMFERENCE;
              const dash = Math.max(length - gap, 0.5);
              const dashOffset = -offset;

              offset += length;

              return (
                <circle
                  key={slice.id}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={dashOffset}
                  style={{ stroke: slice.color }}
                />
              );
            })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-[var(--ink)]">
            {formatCount(total)}
          </span>

          <span className="text-[11px] text-[var(--muted)]">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {slices.map((slice) => (
          <li
            key={slice.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 text-[var(--muted)]">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
                aria-hidden="true"
              />

              <span className="truncate">{slice.label}</span>
            </span>

            <span className="shrink-0 font-semibold text-[var(--ink)]">
              {formatCount(slice.value)}

              <span className="ml-1.5 text-xs font-normal text-[var(--muted)]">
                {formatPercent(total > 0 ? slice.value / total : null)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
