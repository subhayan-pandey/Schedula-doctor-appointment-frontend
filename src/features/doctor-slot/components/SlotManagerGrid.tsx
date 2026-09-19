import type { Slot } from "@/types/slot";

const STATUS_STYLES: Record<Slot["status"], string> = {
  available:
    "bg-[var(--success-soft)] text-[var(--success)]",
  booked:
    "bg-[var(--brand-soft)] text-[var(--brand-deep)]",
  unavailable:
    "bg-stone-100 text-[var(--muted)]",
};

const STATUS_LABELS: Record<Slot["status"], string> = {
  available: "Available",
  booked: "Booked",
  unavailable: "Unavailable",
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
  if (slots.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {slots.length} slot{slots.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-2.5">
        {slots.map((slot) => (
          <li
            key={slot.id}
            className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5 sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {slot.time}
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  {slot.status === "booked"
                    ? "Reserved for an appointment"
                    : slot.status === "unavailable"
                      ? "Hidden from patient booking"
                      : "Visible to patients for booking"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[slot.status]}`}
                >
                  {STATUS_LABELS[slot.status]}
                </span>

                {slot.status !== "booked" && (
                  <>
                    <button
                      type="button"
                      onClick={() => onToggle(slot.id)}
                      className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-deep)] transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                    >
                      {slot.status === "available"
                        ? "Mark unavailable"
                        : "Mark available"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemove(slot.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--urgent-deep)] transition-colors hover:bg-[var(--urgent-soft)]"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}