"use client";

import type { ReactNode } from "react";

import {
  CHART_MARGIN,
  labelStep,
  type ChartBucket,
  type ChartSeries,
} from "@/components/admin/charts/chart-utils";

type AxesProps = {
  ticks: number[];
  plotWidth: number;
  plotHeight: number;
  yFor: (value: number) => number;
  formatTick: (value: number) => string;
};

/** Horizontal grid lines + y-axis tick labels. */
export function YAxis({
  ticks,
  plotWidth,
  plotHeight,
  yFor,
  formatTick,
}: AxesProps) {
  return (
    <g>
      {ticks.map((tick) => {
        const y = yFor(tick);

        return (
          <g key={tick}>
            <line
              x1={0}
              x2={plotWidth}
              y1={y}
              y2={y}
              style={{
                stroke: "var(--line)",
                strokeDasharray: tick === 0 ? undefined : "3 4",
              }}
            />

            <text
              x={-8}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-[10px]"
              style={{ fill: "var(--muted)" }}
            >
              {formatTick(tick)}
            </text>
          </g>
        );
      })}

      <line
        x1={0}
        x2={plotWidth}
        y1={plotHeight}
        y2={plotHeight}
        style={{ stroke: "var(--line)" }}
      />
    </g>
  );
}

/** Thinned x-axis labels (never overlap, always keeps the last label). */
export function XAxis({
  buckets,
  xFor,
  plotWidth,
  plotHeight,
}: {
  buckets: ChartBucket[];
  xFor: (index: number) => number;
  plotWidth: number;
  plotHeight: number;
}) {
  const step = labelStep(buckets.length, plotWidth);

  return (
    <g>
      {buckets.map((bucket, index) => {
        // Thin the labels, and drop one that would crowd the final label.
        const isLast = index === buckets.length - 1;
        const show =
          index % step === 0 && (isLast || buckets.length - 1 - index >= step);

        if (!show) {
          return null;
        }

        return (
          <text
            key={bucket.key}
            x={xFor(index)}
            y={plotHeight + 18}
            textAnchor="middle"
            className="text-[10px]"
            style={{ fill: "var(--muted)" }}
          >
            {bucket.label}
          </text>
        );
      })}
    </g>
  );
}

type TooltipProps = {
  title: string;
  rows: { id: string; label: string; color: string; value: string }[];
  /** Pixel x inside the plot area. */
  x: number;
  containerWidth: number;
};

export function ChartTooltip({ title, rows, x, containerWidth }: TooltipProps) {
  const TOOLTIP_HALF = 80;
  const rawLeft = CHART_MARGIN.left + x;
  const left = Math.min(
    Math.max(rawLeft, TOOLTIP_HALF),
    Math.max(containerWidth - TOOLTIP_HALF, TOOLTIP_HALF),
  );

  return (
    <div
      className="pointer-events-none absolute top-0 z-10 w-40 -translate-x-1/2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 shadow-md"
      style={{ left }}
      role="status"
    >
      <p className="text-[11px] font-semibold text-[var(--ink)]">{title}</p>

      <ul className="mt-1 space-y-0.5">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-2 text-[11px] text-[var(--muted)]"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
                aria-hidden="true"
              />
              <span className="truncate">{row.label}</span>
            </span>

            <span className="font-semibold text-[var(--ink)]">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Screen-reader fallback for any chart: the same numbers as a table. */
export function ChartDataTable({
  caption,
  buckets,
  series,
  format,
}: {
  caption: string;
  buckets: ChartBucket[];
  series: ChartSeries[];
  format: (value: number) => string;
}): ReactNode {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>

      <thead>
        <tr>
          <th scope="col">Period</th>

          {series.map((item) => (
            <th key={item.id} scope="col">
              {item.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {buckets.map((bucket, index) => (
          <tr key={bucket.key}>
            <th scope="row">{bucket.fullLabel}</th>

            {series.map((item) => (
              <td key={item.id}>{format(item.values[index] ?? 0)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
