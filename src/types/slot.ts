export type SlotStatus = "available" | "booked" | "unavailable";

export type Slot = {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM - 09:45 AM"
  period: "Morning" | "Evening";
  status: SlotStatus;
};