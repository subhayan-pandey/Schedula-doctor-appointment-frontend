export type SupportTicketStatus =
  | "open"
  | "in-progress"
  | "resolved"
  | "closed";

export type SupportTicketPriority =
  | "low"
  | "medium"
  | "high";

export type SupportTicketCategory =
  | "appointment"
  | "booking"
  | "payment"
  | "doctor"
  | "account"
  | "technical"
  | "other";

export type SupportTicketMessage = {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: "patient" | "doctor";
  message: string;
  createdAt: string;
};

export type SupportTicket = {
  id: string;

  creatorId: string;
  creatorRole: "patient" | "doctor";

  subject: string;
  description: string;

  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};