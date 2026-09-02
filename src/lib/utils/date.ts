export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getNextDays(count: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => addDays(today, index));
}

export function formatDayNumber(date: Date): string {
  return String(date.getDate()).padStart(2, "0");
}

export function formatWeekday(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatLongDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Converts a 24-hour "HH:MM" input value (e.g. from <input type="time">)
 * into a 12-hour display string, e.g. "09:30 AM". */
export function formatTime12h(time24: string): string {
  const [hoursStr, minutesStr] = time24.split(":");
  const hours = Number(hoursStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(displayHours).padStart(2, "0")}:${minutesStr} ${period}`;
}