"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";

import Modal from "@/components/admin/ui/Modal";
import { adminToast } from "@/components/admin/ui/toast";

import {
  getAllRecipientOptions,
  sendAdminNotification,
  type RecipientOption,
} from "@/lib/admin/admin-notifications";
import { logAdminAction } from "@/lib/admin/audit-log-store";
import { hasAdminPermission } from "@/lib/admin/admin-permissions";

import { useAdminAuth } from "@/context/AdminAuthContext";

type Audience = "all-patients" | "all-doctors" | "all-users" | "selected";

const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: "all-patients", label: "All Patients" },
  { value: "all-doctors", label: "All Doctors" },
  { value: "all-users", label: "All Patients & Doctors" },
  { value: "selected", label: "Selected users" },
];

const fieldClassName =
  "rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

type ComposeNotificationModalProps = {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
};

export default function ComposeNotificationModal({
  open,
  onClose,
  onSent,
}: ComposeNotificationModalProps) {
  const { adminUser } = useAdminAuth();
  const canCreateNotifications = hasAdminPermission(
    adminUser,
    "notifications",
    "create",
  );

  const [recipientOptions] = useState<RecipientOption[]>(() =>
    getAllRecipientOptions(),
  );

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<Audience>("all-patients");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recipientSearch, setRecipientSearch] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const doctors = useMemo(
    () => recipientOptions.filter((option) => option.role === "doctor"),
    [recipientOptions],
  );
  const patients = useMemo(
    () => recipientOptions.filter((option) => option.role === "patient"),
    [recipientOptions],
  );

  const filteredOptions = useMemo(() => {
    const normalized = recipientSearch.trim().toLowerCase();

    if (!normalized) {
      return recipientOptions;
    }

    return recipientOptions.filter((option) =>
      option.name.toLowerCase().includes(normalized),
    );
  }, [recipientOptions, recipientSearch]);

  function toggleRecipient(id: string): void {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function resolveRecipients(): RecipientOption[] {
    if (audience === "all-patients") {
      return patients;
    }

    if (audience === "all-doctors") {
      return doctors;
    }

    if (audience === "all-users") {
      return recipientOptions;
    }

    return recipientOptions.filter((option) => selectedIds.has(option.id));
  }

  function resetForm(): void {
    setTitle("");
    setMessage("");
    setAudience("all-patients");
    setSelectedIds(new Set());
    setRecipientSearch("");
    setError("");
  }

  function handleClose(): void {
    if (isSending) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleSend(): Promise<void> {
    if (!canCreateNotifications) {
      adminToast.error("You do not have permission to send notifications.");
      return;
    }

    if (!title.trim() || !message.trim()) {
      setError("Title and message are both required.");
      return;
    }

    const recipients = resolveRecipients();

    if (recipients.length === 0) {
      setError(
        audience === "selected"
          ? "Select at least one recipient."
          : "No recipients found for this audience.",
      );
      return;
    }

    setError("");
    setIsSending(true);

    const result = sendAdminNotification({
      title: title.trim(),
      message: message.trim(),
      recipients,
    });

    if (adminUser) {
      logAdminAction({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: "send",
        entityType: "notification",
        entityId: `broadcast-${Date.now()}`,
        entityLabel: title.trim(),
        description: `${adminUser.name} sent "${title.trim()}" to ${
          recipients.length
        } recipient${recipients.length === 1 ? "" : "s"}`,
        details: {
          audience,
          sentCount: result.sentCount,
          skippedCount: result.skippedCount,
        },
      });
    }

    setIsSending(false);

    adminToast.success(
      result.skippedCount > 0
        ? `Sent to ${result.sentCount} of ${recipients.length} (${result.skippedCount} opted out of system notifications).`
        : `Sent to ${result.sentCount} recipient${
            result.sentCount === 1 ? "" : "s"
          }.`,
    );

    onSent();
    resetForm();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      title="Compose notification"
      closeOnBackdropClick={!isSending}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSend} disabled={isSending || !canCreateNotifications}>
            {isSending ? "Sending…" : "Send"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="notif-title" className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Title
          </label>
          <input
            id="notif-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Scheduled maintenance tonight"
            className={fieldClassName}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notif-message" className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Message
          </label>
          <textarea
            id="notif-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder="Keep it short — this shows up in the recipient's notification list."
            className={fieldClassName}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Send to
          </p>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAudience(option.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  audience === option.value
                    ? "bg-[var(--brand)] text-white"
                    : "border border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand)]/40"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {audience === "selected" && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={recipientSearch}
              onChange={(event) => setRecipientSearch(event.target.value)}
              placeholder="Search patients or doctors…"
              className={fieldClassName}
            />

            <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--line)]">
              {filteredOptions.length === 0 ? (
                <p className="p-3 text-xs text-[var(--muted)]">No matches.</p>
              ) : (
                filteredOptions.map((option) => (
                  <label
                    key={`${option.role}-${option.id}`}
                    className="flex cursor-pointer items-center gap-2.5 border-b border-[var(--line)] px-3 py-2 text-sm last:border-b-0 hover:bg-[var(--brand-soft)]/30"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(option.id)}
                      onChange={() => toggleRecipient(option.id)}
                      className="size-4 accent-[var(--brand)]"
                    />
                    <span className="flex-1 truncate text-[var(--ink)]">
                      {option.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-[var(--line)]/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                      {option.role}
                    </span>
                  </label>
                ))
              )}
            </div>

            <p className="text-xs text-[var(--muted)]">
              {selectedIds.size} selected
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs font-medium text-[var(--urgent-deep)]" role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
