import type { Slot } from "@/types/slot";

const STATUS_STYLES: Record<Slot["status"], string> = {
  available: "bg-[var(--success-soft)] text-[var(--success)]",
  booked: "bg-[var(--brand-soft)] text-[var(--brand-deep)]",
  unavailable: "bg-stone-100 text-[var(--muted)]",
};

export default function SlotManagerGrid({
  title,
  slots,
  onToggle,
  onRemove,
}: {
  title: string;
  slots: Slot[];
  onToggle: (slotId: string) => void;
  onRemove: (slotId: string) => void;
}) {
  if (slots.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {slots.map((slot) => (
          <li
            key={slot.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5"
          >
            <span className="text-sm font-medium text-[var(--ink)]">{slot.time}</span>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[slot.status]}`}
              >
                {slot.status}
              </span>
              {slot.status !== "booked" && (
                <>
                  <button
                    type="button"
                    onClick={() => onToggle(slot.id)}
                    className="text-xs font-semibold text-[var(--brand-deep)] hover:underline"
                  >
                    {slot.status === "available" ? "Mark unavailable" : "Mark available"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(slot.id)}
                    className="text-xs font-semibold text-[var(--urgent-deep)] hover:underline"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}