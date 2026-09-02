import { formatDayNumber, formatWeekday, toISODate } from "@/lib/utils/date";

export default function DateStrip({
  days,
  selectedDate,
  onSelect,
}: {
  days: Date[];
  selectedDate: string;
  onSelect: (isoDate: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((day) => {
        const iso = toISODate(day);
        const isSelected = iso === selectedDate;
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            aria-pressed={isSelected}
            className={`flex min-w-16 flex-col items-center gap-0.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
              isSelected
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand)]"
            }`}
          >
            <span className="font-semibold">{formatDayNumber(day)}</span>
            <span className={isSelected ? "text-white/80" : "text-[var(--muted)]"}>
              {formatWeekday(day)}
            </span>
          </button>
        );
      })}
    </div>
  );
}