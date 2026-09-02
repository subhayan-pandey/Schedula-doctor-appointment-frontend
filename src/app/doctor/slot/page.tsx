import type { Metadata } from "next";
import SlotManager from "@/features/doctor-slot/components/SlotManager";

export const metadata: Metadata = {
  title: "Manage Availability | Schedula",
};

export default function DoctorSlotsPage() {
  return <SlotManager />;
}