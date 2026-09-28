"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import { formatInr } from "@/lib/payments";
import { getPaymentHistory } from "@/lib/payment-store";
import type { RootState } from "@/store";
import type { PaymentRecord } from "@/types/payment";

export default function PaymentHistory({ role }: { role: "patient" | "doctor" }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const bookings = useSelector((state: RootState) => state.appointments.appointments);
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  useEffect(() => {
    const refresh = () => setRecords(getPaymentHistory());
    refresh();
    window.addEventListener("schedula:payments-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("schedula:payments-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  if (!user || user.role !== role) return <div className="mx-auto max-w-3xl px-4 py-12 text-sm text-[var(--muted)]">Log in with a {role} account to view payment history.</div>;
  const visible = records.filter((record) => role === "patient" ? record.patientId === user.id : record.doctorId === user.id);
  const completed = bookings.filter((booking) => booking.doctorId === user.id && booking.status === "completed" && booking.paymentStatus === "paid");
  const earnings = completed.reduce((sum, booking) => sum + (booking.amountInr ?? 0) - (booking.refundAmountInr ?? 0), 0);
  return <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">{role === "patient" ? "Patient portal" : "Practice finances"}</p><h1 className="mt-1 text-2xl font-semibold text-[var(--ink)]">Payment history</h1></div>
      <Link href={role === "patient" ? "/appointments" : "/doctor/appointments"}><Button size="sm" variant="outline">Appointments</Button></Link>
    </div>
    {role === "doctor" && <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5"><p className="text-sm text-[var(--muted)]">Completed appointment earnings</p><p className="mt-1 text-2xl font-semibold text-[var(--ink)]">{formatInr(earnings)}</p></div>}
    {visible.length === 0 ? <div className="mt-6 rounded-xl border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]">No payment activity yet.</div> : <div className="mt-6 space-y-3">{visible.map((record) => {
      const booking = record.bookingId ? bookings.find((item) => item.id === record.bookingId) : undefined;
      const status = booking?.paymentStatus === "refunded" || booking?.refundStatus === "refunded" ? "Refunded" : booking?.refundStatus === "requested" ? "Refund requested" : booking?.refundStatus === "eligible" ? "Refund eligible" : record.status === "refund-processing" ? "Refund processing" : record.status;
      return <article key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"><div><p className="font-medium text-[var(--ink)]">{role === "patient" ? `Dr. ${record.doctorName}` : record.patientName}</p><p className="mt-1 text-xs text-[var(--muted)]">{new Date(record.createdAt).toLocaleString("en-IN")} · {record.method.toUpperCase()} · {record.reference}</p></div><div className="text-right"><p className="font-semibold text-[var(--ink)]">{formatInr(record.amountInr)}</p><p className="mt-1 text-xs capitalize text-[var(--muted)]">{status}</p></div></article>;
    })}</div>}
  </div>;
}
