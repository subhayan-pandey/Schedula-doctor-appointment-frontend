import type { Metadata } from "next";

import DoctorCalendar from "@/features/doctor-calender/components/DoctorCalender";

export const metadata: Metadata = {
  title: "Calendar | Schedula",
};

export default function DoctorCalendarPage() {
  return <DoctorCalendar />;
}