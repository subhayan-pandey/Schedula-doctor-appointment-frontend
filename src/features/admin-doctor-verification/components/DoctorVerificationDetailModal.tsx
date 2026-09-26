import Button from "@/components/ui/Button";

import Modal from "@/components/admin/ui/Modal";

import DoctorProfileSummary, {
  DetailRow,
} from "@/features/admin-doctors/components/DoctorProfileSummary";

import type { AdminDoctorView } from "@/lib/admin/admin-doctors";

type DoctorVerificationDetailModalProps = {
  doctor: AdminDoctorView | null;
  open: boolean;
  onClose: () => void;
  onRequestApprove: (doctor: AdminDoctorView) => void;
  onRequestReject: (doctor: AdminDoctorView) => void;
  onRequestResubmit: (doctor: AdminDoctorView) => void;
};

export default function DoctorVerificationDetailModal({
  doctor,
  open,
  onClose,
  onRequestApprove,
  onRequestReject,
  onRequestResubmit,
}: DoctorVerificationDetailModalProps) {
  if (!doctor) {
    return null;
  }

  const documents = doctor.verificationDocuments ?? [];

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Verification review">
      <div className="flex flex-col gap-6">
        <DoctorProfileSummary doctor={doctor} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Submitted documents
          </p>

          {documents.length === 0 ? (
            <p className="mt-1.5 text-sm text-[var(--muted)]">
              No documents on file for this doctor.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {documents.map((document) => (
                <li
                  key={document.id}
                  className="flex items-center gap-3 rounded-lg border border-[var(--line)] px-3 py-2.5"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)]">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 3v5a1 1 0 0 0 1 1h5" />
                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                    </svg>
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--ink)]">
                      {document.name}
                    </p>
                    <p className="truncate text-xs text-[var(--muted)]">
                      {document.type}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-2 text-xs text-[var(--muted)]">
            Document preview isn&apos;t available in this demo — file names
            are mock data.
          </p>
        </div>

        {doctor.verificationStatus === "rejected" && doctor.rejectionReason && (
          <DetailRow label="Rejection reason" value={doctor.rejectionReason} />
        )}

        {doctor.verificationStatus === "pending" && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--line)] pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-[var(--urgent)] text-[var(--urgent-deep)] hover:bg-[var(--urgent-soft)]"
              onClick={() => onRequestReject(doctor)}
            >
              Reject
            </Button>
            <Button type="button" onClick={() => onRequestApprove(doctor)}>
              Approve
            </Button>
          </div>
        )}

        {doctor.verificationStatus === "rejected" && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
            <p className="text-xs text-[var(--muted)]">
              In a real deployment, the doctor resubmits from their own
              dashboard. This demo doesn&apos;t have that flow yet, so use
              this to simulate it.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => onRequestResubmit(doctor)}
            >
              Reset to pending (demo)
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
