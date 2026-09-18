import DoctorCard from "@/components/doctor/DoctorCard";
import EmptyState from "@/components/ui/EmptyState";

import type { Doctor } from "@/types/doctor";

export default function DoctorList({
  doctors,
}: {
  doctors: Doctor[];
}) {
  if (doctors.length === 0) {
    return (
      <EmptyState
        title="No doctors match your filters"
        description="Try a different specialty, change your search, or clear the filters to see more doctors."
      />
    );
  }

  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {doctors.map(
        (doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
          />
        ),
      )}
    </div>
  );
}