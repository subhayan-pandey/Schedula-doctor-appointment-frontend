import type { Booking } from "@/types/booking";

export function formatInr(amount?: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

export function eligibleRefundPercent(booking: Booking): number {
  if (booking.missedBy === "doctor") return 100;
  if (booking.missedBy === "patient") {
    return booking.reschedulePendingPatient ? 0 : 50;
  }
  if (booking.status === "cancelled" && (booking.actionReason?.startsWith("Appointment cancelled by doctor") || booking.actionReason?.includes("doctor decline"))) return 100;
  if (booking.status === "cancelled" && booking.actionReason?.includes("patient")) return 50;
  if (booking.status === "missed") return 50;
  return 0;
}

export function isRefundEligible(booking: Booking): boolean {
  return ["cancelled", "missed"].includes(booking.status) &&
    eligibleRefundPercent(booking) > 0 &&
    booking.paymentStatus === "paid" &&
    (!booking.refundStatus || ["eligible", "rejected"].includes(booking.refundStatus));
}

export function downloadInvoice(booking: Booking, doctorName: string): void {
  const lines = [
    "Schedula - Payment Invoice",
    `Invoice: INV-${booking.id.slice(-8).toUpperCase()}`,
    `Appointment: ${booking.date} at ${booking.time}`,
    `Patient: ${booking.patientName}`,
    `Doctor: ${doctorName}`,
    `Consultation: ${booking.consultationType === "online" ? "Online" : "In-person"}`,
    `Payment method: ${(booking.paymentMethod ?? "card").toUpperCase()} (demo)`,
    `Amount paid: ${formatInr(booking.amountInr).replace("₹", "INR ")}`,
    `Payment reference: ${booking.paymentReference ?? "Demo payment"}`,
    "This invoice is generated for a frontend demonstration.",
  ];
  const escapePdf = (value: string) => value.replace(/[^\x20-\x7E]/g, "?").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const stream = `BT\n/F1 14 Tf\n50 790 Td\n${lines.map((line, index) => `${index ? "0 -28 Td\n/F1 11 Tf\n" : ""}(${escapePdf(line)}) Tj`).join("\n")}\nET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `schedula-invoice-${booking.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
