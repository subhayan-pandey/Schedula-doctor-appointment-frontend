"use client";

import { useState } from "react";

import {
  ChartDataTable,
  ChartTooltip,
  XAxis,
  YAxis,
} from "@/components/admin/charts/ChartFrame";
import {
  buildTicks,
  CHART_MARGIN,
  formatCompact,
  formatCount,
  type ChartBucket,
  type ChartSeries,
} from "@/components/admin/charts/chart-utils";
import { useElementWidth } from "@/components/admin/charts/useElementWidth";

type BarChartProps = {
  buckets: ChartBucket[];
  series: ChartSeries[];
  ariaLabel: string;
  height?: number;
  formatTick?: (value: number) => string;
  formatValue?: (value: number) => string;
};

export default function BarChart({
  buckets,
  series,
  ariaLabel,
  height = 260,
  formatTick = formatCompact,
  formatValue = formatCount,
}: BarChartProps) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = Math.max(width - CHART_MARGIN.left - CHART_MARGIN.right, 0);
  const plotHeight = height - CHART_MARGIN.top - CHART_MARGIN.bottom;

  const maxValue = Math.max(...series.flatMap((item) => item.values), 0);
  const ticks = buildTicks(maxValue);
  const top = ticks[ticks.length - 1];

  const count = Math.max(buckets.length, 1);
  const band = plotWidth / count;
  const groupWidth = Math.min(band * 0.72, 56 * series.length);
  const barGap = series.length > 1 ? 2 : 0;
  const barWidth = Math.max(
    (groupWidth - barGap * (series.length - 1)) / series.length,
    1,
  );

  const xCenter = (index: number) => band * index + band / 2;
  const yFor = (value: number) => plotHeight - (value / top) * plotHeight;

  function handlePointerMove(clientX: number, left: number) {
    if (band === 0) {
      return;
    }

    const index = Math.floor((clientX - left - CHART_MARGIN.left) / band);

    setHoverIndex(Math.min(Math.max(index, 0), buckets.length - 1));
  }

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <>
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={ariaLabel}
            onPointerMove={(event) =>
              handlePointerMove(
                event.clientX,
                event.currentTarget.getBoundingClientRect().left,
              )
            }
            onPointerLeave={() => setHoverIndex(null)}
            className="touch-pan-y"
          >
            <g transform={`translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`}>
              <YAxis
                ticks={ticks}
                plotWidth={plotWidth}
                plotHeight={plotHeight}
                yFor={yFor}
                formatTick={formatTick}
              />

              <XAxis
                buckets={buckets}
                xFor={xCenter}
                plotWidth={plotWidth}
                plotHeight={plotHeight}
              />

              {hoverIndex !== null && (
                <rect
                  x={band * hoverIndex}
                  y={0}
                  width={band}
                  height={plotHeight}
                  style={{ fill: "var(--brand-soft)", opacity: 0.6 }}
                />
              )}

              {buckets.map((bucket, bucketIndex) => (
                <g
                  key={bucket.key}
                  transform={`translate(${xCenter(bucketIndex) - groupWidth / 2},0)`}
                >
                  {series.map((item, seriesIndex) => {
                    const value = item.values[bucketIndex] ?? 0;
                    const barHeight = plotHeight - yFor(value);

                    return (
                      <rect
                        key={item.id}
                        x={seriesIndex * (barWidth + barGap)}
                        y={yFor(value)}
                        width={barWidth}
                        height={Math.max(barHeight, 0)}
                        rx={Math.min(3, barWidth / 2)}
                        style={{ fill: item.color }}
                      />
                    );
                  })}
                </g>
              ))}
            </g>
          </svg>

          {hoverIndex !== null && buckets[hoverIndex] && (
            <ChartTooltip
              title={buckets[hoverIndex].fullLabel}
              x={xCenter(hoverIndex)}
              containerWidth={width}
              rows={series.map((item) => ({
                id: item.id,
                label: item.label,
                color: item.color,
                value: formatValue(item.values[hoverIndex] ?? 0),
              }))}
            />
          )}

          <ChartDataTable
            caption={ariaLabel}
            buckets={buckets}
            series={series}
            format={formatValue}
          />
        </>
      )}
    </div>
  );
}
