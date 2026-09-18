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
  onSelect: (
    slotId: string,
  ) => void;
}) {
  if (slots.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--ink)]">
          {title}
        </h3>

        <span className="text-xs text-[var(--muted)]">
          {slots.length} slots
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {slots.map(
          (slot) => {
            const isBookable =
              slot.status ===
              "available";

            const isSelected =
              slot.id ===
              selectedSlotId;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={
                  !isBookable
                }
                onClick={() =>
                  onSelect(
                    slot.id,
                  )
                }
                aria-pressed={
                  isSelected
                }
                className={`min-h-11 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-soft)] ${
                  isSelected
                    ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm"
                    : isBookable
                      ? "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                      : "cursor-not-allowed border-[var(--line)] bg-stone-50 text-[var(--muted)] opacity-70"
                }`}
              >
                <span
                  className={
                    !isBookable &&
                    !isSelected
                      ? "line-through"
                      : ""
                  }
                >
                  {slot.time}
                </span>

                {!isBookable &&
                  !isSelected && (
                    <span className="ml-1 text-[10px]">
                      Booked
                    </span>
                  )}
              </button>
            );
          },
        )}
      </div>
    </section>
  );
}