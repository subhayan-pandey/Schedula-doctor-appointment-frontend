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

type LineChartProps = {
  buckets: ChartBucket[];
  series: ChartSeries[];
  ariaLabel: string;
  height?: number;
  /** Axis tick formatter (defaults to compact numbers). */
  formatTick?: (value: number) => string;
  /** Tooltip / table value formatter (defaults to grouped integers). */
  formatValue?: (value: number) => string;
  /** Fill the area under the first series. */
  area?: boolean;
};

export default function LineChart({
  buckets,
  series,
  ariaLabel,
  height = 260,
  formatTick = formatCompact,
  formatValue = formatCount,
  area = true,
}: LineChartProps) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = Math.max(width - CHART_MARGIN.left - CHART_MARGIN.right, 0);
  const plotHeight = height - CHART_MARGIN.top - CHART_MARGIN.bottom;

  const maxValue = Math.max(...series.flatMap((item) => item.values), 0);
  const ticks = buildTicks(maxValue);
  const top = ticks[ticks.length - 1];

  const count = buckets.length;
  const xFor = (index: number) =>
    count <= 1 ? plotWidth / 2 : (index / (count - 1)) * plotWidth;
  const yFor = (value: number) => plotHeight - (value / top) * plotHeight;

  function handlePointerMove(clientX: number, left: number) {
    if (count === 0 || plotWidth === 0) {
      return;
    }

    const relative = clientX - left - CHART_MARGIN.left;
    const index =
      count <= 1 ? 0 : Math.round((relative / plotWidth) * (count - 1));

    setHoverIndex(Math.min(Math.max(index, 0), count - 1));
  }

  const showDots = count <= 40;

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
                xFor={xFor}
                plotWidth={plotWidth}
                plotHeight={plotHeight}
              />

              {area && series[0] && count > 1 && (
                <path
                  d={`M${xFor(0)},${plotHeight} ${series[0].values
                    .map((value, index) => `L${xFor(index)},${yFor(value)}`)
                    .join(" ")} L${xFor(count - 1)},${plotHeight} Z`}
                  style={{ fill: series[0].color, opacity: 0.1 }}
                />
              )}

              {series.map((item) => (
                <g key={item.id}>
                  {count > 1 && (
                    <polyline
                      fill="none"
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={item.values
                        .map((value, index) => `${xFor(index)},${yFor(value)}`)
                        .join(" ")}
                      style={{ stroke: item.color }}
                    />
                  )}

                  {(showDots || count === 1) &&
                    item.values.map((value, index) => (
                      <circle
                        key={buckets[index]?.key ?? index}
                        cx={xFor(index)}
                        cy={yFor(value)}
                        r={hoverIndex === index ? 4.5 : 3}
                        style={{
                          fill: "var(--surface)",
                          stroke: item.color,
                          strokeWidth: 2,
                        }}
                      />
                    ))}

                  {!showDots &&
                    count > 1 &&
                    hoverIndex !== null &&
                    item.values[hoverIndex] !== undefined && (
                      <circle
                        cx={xFor(hoverIndex)}
                        cy={yFor(item.values[hoverIndex])}
                        r={4.5}
                        style={{
                          fill: "var(--surface)",
                          stroke: item.color,
                          strokeWidth: 2,
                        }}
                      />
                    )}
                </g>
              ))}

              {hoverIndex !== null && (
                <line
                  x1={xFor(hoverIndex)}
                  x2={xFor(hoverIndex)}
                  y1={0}
                  y2={plotHeight}
                  style={{ stroke: "var(--muted)", opacity: 0.4 }}
                />
              )}
            </g>
          </svg>

          {hoverIndex !== null && buckets[hoverIndex] && (
            <ChartTooltip
              title={buckets[hoverIndex].fullLabel}
              x={xFor(hoverIndex)}
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
