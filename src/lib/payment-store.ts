import type { PaymentRecord } from "@/types/payment";

const KEY = "schedula:payments";

export function getPaymentHistory(): PaymentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const records = raw ? JSON.parse(raw) as PaymentRecord[] : [];
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

export function addPaymentRecord(record: PaymentRecord): void {
  const records = getPaymentHistory();
  try {
    window.localStorage.setItem(KEY, JSON.stringify([record, ...records]));
  } catch {
    // Keep the demo interactive when browser storage is unavailable.
  }
  window.dispatchEvent(new Event("schedula:payments-updated"));
}
