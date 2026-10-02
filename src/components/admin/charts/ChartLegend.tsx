type LegendItem = {
  id: string;
  label: string;
  color: string;
};

export default function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Chart legend">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]"
        >
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />

          {item.label}
        </li>
      ))}
    </ul>
  );
}
