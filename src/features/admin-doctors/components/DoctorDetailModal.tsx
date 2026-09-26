import Button from "@/components/ui/Button";

import Modal from "@/components/admin/ui/Modal";

import DoctorProfileSummary from "@/features/admin-doctors/components/DoctorProfileSummary";

import type { AdminDoctorView } from "@/lib/admin/admin-doctors";

type DoctorDetailModalProps = {
  doctor: AdminDoctorView | null;
  open: boolean;
  onClose: () => void;
  onRequestToggleActive: (doctor: AdminDoctorView) => void;
};

export default function DoctorDetailModal({
  doctor,
  open,
  onClose,
  onRequestToggleActive,
}: DoctorDetailModalProps) {
  if (!doctor) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Doctor profile">
      <div className="flex flex-col gap-6">
        <DoctorProfileSummary doctor={doctor} />

        <div className="flex justify-end border-t border-[var(--line)] pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onRequestToggleActive(doctor)}
            className={
              doctor.isActive
                ? "border-[var(--urgent)] text-[var(--urgent-deep)] hover:bg-[var(--urgent-soft)]"
                : undefined
            }
          >
            {doctor.isActive ? "Deactivate doctor" : "Activate doctor"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
