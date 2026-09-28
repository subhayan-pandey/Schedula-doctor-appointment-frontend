import type { PaymentRecord } from "@/types/payment";
import { getSharedCollection, updateSharedCollection, emitLegacyViewEvent } from "@/lib/redux-data";
export function getPaymentHistory(): PaymentRecord[] { return getSharedCollection<PaymentRecord>("payments"); }
export function addPaymentRecord(record: PaymentRecord): void {
  updateSharedCollection<PaymentRecord>("payments", (items) => [record, ...items.filter((item) => item.id !== record.id)]);
  emitLegacyViewEvent("schedula:payments-updated");
}
