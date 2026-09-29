import Button from "@/components/ui/Button";

import Modal from "@/components/admin/ui/Modal";
import StatusBadge from "@/components/admin/ui/StatusBadge";

import type { AdminReviewView } from "@/lib/admin/admin-reviews";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-[var(--ink)]">{value}</p>
    </div>
  );
}

type ReviewDetailModalProps = {
  review: AdminReviewView | null;
  open: boolean;
  onClose: () => void;
  onRequestToggleReported: (review: AdminReviewView) => void;
  onRequestToggleHidden: (review: AdminReviewView) => void;
};

export default function ReviewDetailModal({
  review,
  open,
  onClose,
  onRequestToggleReported,
  onRequestToggleHidden,
}: ReviewDetailModalProps) {
  if (!review) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} size="md" title="Review">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={`★ ${review.rating} / 5`} tone="brand" />
          {review.reported && <StatusBadge label="Reported" tone="warning" />}
          {review.hidden && <StatusBadge label="Hidden" tone="neutral" />}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DetailRow label="Doctor" value={review.doctorName} />
          <DetailRow label="Patient" value={review.patientName} />
          <DetailRow
            label="Posted"
            value={new Date(review.createdAt).toLocaleString("en-IN")}
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Comment
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--ink)]">
            {review.comment || "(no comment left)"}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--line)] pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onRequestToggleReported(review)}
          >
            {review.reported ? "Clear report" : "Mark as reported"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className={
              !review.hidden
                ? "border-[var(--urgent)] text-[var(--urgent-deep)] hover:bg-[var(--urgent-soft)]"
                : undefined
            }
            onClick={() => onRequestToggleHidden(review)}
          >
            {review.hidden ? "Unhide review" : "Hide review"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
