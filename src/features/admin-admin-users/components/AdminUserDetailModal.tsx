import Button from "@/components/ui/Button";

import Modal from "@/components/admin/ui/Modal";
import StatusBadge from "@/components/admin/ui/StatusBadge";

import { formatAdminRole, getAdminRoleTone } from "@/lib/admin/admin-roles";
import { getInitials } from "@/lib/utils/text";

import type { AdminAccount } from "@/lib/admin/admin-accounts-store";

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

type AdminUserDetailModalProps = {
  account: AdminAccount | null;
  open: boolean;
  isSelf: boolean;
  onClose: () => void;
  onRequestEdit: (account: AdminAccount) => void;
  onRequestToggleActive: (account: AdminAccount) => void;
};

export default function AdminUserDetailModal({
  account,
  open,
  isSelf,
  onClose,
  onRequestEdit,
  onRequestToggleActive,
}: AdminUserDetailModalProps) {
  if (!account) {
    return null;
  }

  const isActive = account.isActive !== false;

  return (
    <Modal open={open} onClose={onClose} size="md" title="Admin account">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-lg font-semibold text-[var(--brand-deep)]">
            {getInitials(account.name)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-[var(--ink)]">{account.name}</p>
            <p className="text-sm text-[var(--muted)]">{account.email}</p>

            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge
                label={isActive ? "Active" : "Inactive"}
                tone={isActive ? "success" : "neutral"}
                withDot
              />
              <StatusBadge
                label={formatAdminRole(account.role)}
                tone={getAdminRoleTone(account.role)}
              />
            </div>
          </div>
        </div>

        {isSelf && (
          <p className="text-xs text-[var(--muted)]">
            This is your own account — use Admin Settings to change your own
            profile or password, and you can&apos;t deactivate yourself here.
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--line)] pt-4">
          <Button type="button" variant="outline" onClick={() => onRequestEdit(account)}>
            Edit
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSelf}
            className={
              isActive && !isSelf
                ? "border-[var(--urgent)] text-[var(--urgent-deep)] hover:bg-[var(--urgent-soft)]"
                : undefined
            }
            onClick={() => onRequestToggleActive(account)}
          >
            {isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
