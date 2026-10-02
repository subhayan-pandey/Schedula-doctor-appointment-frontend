import Modal from "@/components/admin/ui/Modal";
import StatusBadge from "@/components/admin/ui/StatusBadge";

import { getRecipientName } from "@/lib/admin/admin-notifications";

import type { AppNotification } from "@/types/notification";

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

type NotificationDetailModalProps = {
  notification: AppNotification | null;
  open: boolean;
  onClose: () => void;
};

export default function NotificationDetailModal({
  notification,
  open,
  onClose,
}: NotificationDetailModalProps) {
  if (!notification) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} size="md" title={notification.title}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={notification.isRead ? "Read" : "Unread"}
            tone={notification.isRead ? "neutral" : "brand"}
            withDot
          />
          <StatusBadge label={notification.type} tone="neutral" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DetailRow
            label="Recipient"
            value={getRecipientName(notification.userId, notification.recipientRole)}
          />
          <DetailRow label="Role" value={notification.recipientRole} />
          <DetailRow
            label="Sent"
            value={new Date(notification.createdAt).toLocaleString("en-IN")}
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Message
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--ink)]">
            {notification.message}
          </p>
        </div>
      </div>
    </Modal>
  );
}
