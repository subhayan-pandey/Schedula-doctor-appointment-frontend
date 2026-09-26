"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";

import Modal from "@/components/admin/ui/Modal";

type RejectDoctorDialogProps = {
  open: boolean;
  doctorName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
};

export default function RejectDoctorDialog({
  open,
  doctorName,
  onClose,
  onConfirm,
}: RejectDoctorDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClose(): void {
    if (isSubmitting) {
      return;
    }

    setReason("");
    setError("");
    onClose();
  }

  async function handleSubmit(): Promise<void> {
    const trimmed = reason.trim();

    if (!trimmed) {
      setError("A rejection reason is required.");
      return;
    }

    setIsSubmitting(true);

    await onConfirm(trimmed);

    setIsSubmitting(false);
    setReason("");
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Reject ${doctorName}?`}
      description="This doctor won't be listed as verified until they resubmit and get approved."
      size="sm"
      closeOnBackdropClick={!isSubmitting}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[var(--urgent)] hover:bg-[var(--urgent-deep)]"
          >
            {isSubmitting ? "Rejecting…" : "Reject"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="rejection-reason"
          className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
        >
          Rejection reason (required)
        </label>

        <textarea
          id="rejection-reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);

            if (error) {
              setError("");
            }
          }}
          rows={4}
          placeholder="e.g. License number could not be verified against the registry."
          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
        />

        {error && (
          <p
            className="text-xs font-medium text-[var(--urgent-deep)]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
