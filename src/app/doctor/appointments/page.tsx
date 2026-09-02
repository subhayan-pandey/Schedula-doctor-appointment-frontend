import type { Metadata } from "next";
import DoctorAppointments from "../../../features/doctor-appointments/component/DoctorAppointments";

export const metadata: Metadata = {
  title: "Appointments | Schedula",
};

export default function DoctorAppointmentsPage() {
  return <DoctorAppointments />;
}