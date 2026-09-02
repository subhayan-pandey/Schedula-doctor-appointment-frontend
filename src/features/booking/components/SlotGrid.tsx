import type { Slot } from "@/types/slot";

export default function SlotGrid({
  title,
  slots,
  selectedSlotId,
  onSelect,
}: {
  title: string;
  slots: Slot[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
}) {
  if (slots.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {slots.map((slot) => {
          const isBookable = slot.status === "available";
          const isSelected = slot.id === selectedSlotId;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={!isBookable}
              onClick={() => onSelect(slot.id)}
              aria-pressed={isSelected}
              className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors sm:text-sm ${
                isSelected
                  ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                  : isBookable
                    ? "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand)]"
                    : "cursor-not-allowed border-[var(--line)] bg-stone-50 text-[var(--muted)] line-through"
              }`}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
}