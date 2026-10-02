export type ChartBucket = {
  key: string;
  label: string;
  fullLabel: string;
};

export type ChartSeries = {
  id: string;
  label: string;
  /** Any CSS color, usually a theme variable such as "var(--brand)". */
  color: string;
  values: number[];
};

export type ChartMargin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const CHART_MARGIN: ChartMargin = {
  top: 12,
  right: 12,
  bottom: 28,
  left: 48,
};

function niceNumber(value: number): number {
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;

  return nice * 10 ** exponent;
}

/** Evenly spaced y-axis ticks from 0 up to (at least) `max`. */
export function buildTicks(max: number, integerOnly = true, target = 4) {
  const safeMax = max > 0 ? max : 1;

  let step = niceNumber(safeMax / target);

  if (integerOnly) {
    step = Math.max(1, Math.ceil(step));
  }

  const top = Math.ceil(safeMax / step) * step;
  const ticks: number[] = [];

  for (let value = 0; value <= top + step / 1000; value += step) {
    ticks.push(value);
  }

  return ticks;
}

const compactFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

export function formatCompactInr(value: number): string {
  return `₹${compactFormatter.format(value)}`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatPercent(value: number | null): string {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

/** How many x labels to skip so they never overlap. */
export function labelStep(count: number, plotWidth: number, minGap = 56) {
  const fit = Math.max(1, Math.floor(plotWidth / minGap));

  return Math.max(1, Math.ceil(count / fit));
}
