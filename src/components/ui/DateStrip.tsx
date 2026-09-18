import {
  formatDayNumber,
  formatWeekday,
  toISODate,
} from "@/lib/utils/date";

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
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map((day) => {
        const iso =
          toISODate(day);

        const isSelected =
          iso === selectedDate;

        return (
          <button
            key={iso}
            type="button"
            onClick={() =>
              onSelect(iso)
            }
            aria-pressed={isSelected}
            className={`flex min-w-[68px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-soft)] ${
              isSelected
                ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
            }`}
          >
            <span className="text-base font-semibold">
              {formatDayNumber(day)}
            </span>

            <span
              className={
                isSelected
                  ? "text-xs text-white/80"
                  : "text-xs text-[var(--muted)]"
              }
            >
              {formatWeekday(day)}
            </span>
          </button>
        );
      })}
    </div>
  );
}