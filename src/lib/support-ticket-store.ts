import type { SupportTicket, SupportTicketMessage, SupportTicketStatus, SupportTicketCategory, SupportTicketPriority } from "@/types/support-ticket";
import { getSharedCollection, updateSharedCollection, emitLegacyViewEvent } from "@/lib/redux-data";
const tickets = () => getSharedCollection<SupportTicket>("supportTickets"); const messages = () => getSharedCollection<SupportTicketMessage>("supportTicketMessages");
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
function writeTickets(value: SupportTicket[]) { updateSharedCollection<SupportTicket>("supportTickets", () => value); emitLegacyViewEvent("schedula:support-tickets-updated"); }
function writeMessages(value: SupportTicketMessage[]) { updateSharedCollection<SupportTicketMessage>("supportTicketMessages", () => value); emitLegacyViewEvent("schedula:support-ticket-messages-updated"); }
export function getAllSupportTickets(): SupportTicket[] { return [...tickets()].sort((a,b) => Date.parse(b.updatedAt)-Date.parse(a.updatedAt)); }
export function getSupportTicketsByUserId(userId: string): SupportTicket[] { return getAllSupportTickets().filter((x) => x.creatorId === userId); }
export function getSupportTicketById(ticketId: string): SupportTicket | null { return tickets().find((x) => x.id === ticketId) ?? null; }
export function createSupportTicket(input: { creatorId: string; creatorRole: "patient" | "doctor"; subject: string; description: string; category?: SupportTicketCategory; priority?: SupportTicketPriority }): SupportTicket {
  const now = new Date().toISOString(); const ticket: SupportTicket = { id: id("support-ticket"), creatorId: input.creatorId, creatorRole: input.creatorRole, subject: input.subject.trim(), description: input.description.trim(), category: input.category ?? "other", priority: input.priority ?? "medium", status: "open", createdAt: now, updatedAt: now };
  writeTickets([ticket, ...tickets()]); return ticket;
}
export function updateSupportTicket(ticketId: string, updates: Partial<Pick<SupportTicket, "subject" | "description" | "category" | "priority">>): SupportTicket | null {
  const current = getSupportTicketById(ticketId); if (!current) return null; const updated = { ...current, ...updates, subject: updates.subject?.trim() ?? current.subject, description: updates.description?.trim() ?? current.description, updatedAt: new Date().toISOString() }; writeTickets(tickets().map((x) => x.id === ticketId ? updated : x)); return updated;
}
export function updateSupportTicketStatus(ticketId: string, status: SupportTicketStatus): SupportTicket | null {
  const current = getSupportTicketById(ticketId); if (!current) return null; const now = new Date().toISOString(); const updated = { ...current, status, updatedAt: now, resolvedAt: status === "resolved" || status === "closed" ? current.resolvedAt ?? now : undefined }; writeTickets(tickets().map((x) => x.id === ticketId ? updated : x)); return updated;
}
export function getSupportTicketMessages(ticketId: string): SupportTicketMessage[] { return messages().filter((x) => x.ticketId === ticketId).sort((a,b) => Date.parse(a.createdAt)-Date.parse(b.createdAt)); }
export function addSupportTicketMessage(input: { ticketId: string; senderId: string; senderRole: "patient" | "doctor"; message: string }): SupportTicketMessage | null {
  if (!getSupportTicketById(input.ticketId) || !input.message.trim()) return null; const item: SupportTicketMessage = { id: id("support-message"), ...input, message: input.message.trim(), createdAt: new Date().toISOString() }; writeMessages([...messages(), item]); updateSupportTicket(input.ticketId, {}); return item;
}
export function deleteSupportTicket(ticketId: string): void { writeTickets(tickets().filter((x) => x.id !== ticketId)); writeMessages(messages().filter((x) => x.ticketId !== ticketId)); }
