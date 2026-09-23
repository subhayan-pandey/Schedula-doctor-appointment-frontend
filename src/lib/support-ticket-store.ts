import type {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketMessage,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types/support-ticket";

const TICKETS_KEY =
  "schedula:support-tickets";

const MESSAGES_KEY =
  "schedula:support-ticket-messages";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isTicketStatus(
  value: unknown,
): value is SupportTicketStatus {
  return (
    value === "open" ||
    value === "in-progress" ||
    value === "resolved" ||
    value === "closed"
  );
}

function isTicketPriority(
  value: unknown,
): value is SupportTicketPriority {
  return (
    value === "low" ||
    value === "medium" ||
    value === "high"
  );
}

function isTicketCategory(
  value: unknown,
): value is SupportTicketCategory {
  return (
    value === "appointment" ||
    value === "booking" ||
    value === "payment" ||
    value === "doctor" ||
    value === "account" ||
    value === "technical" ||
    value === "other"
  );
}

function isSenderRole(
  value: unknown,
): value is "patient" | "doctor" {
  return (
    value === "patient" ||
    value === "doctor"
  );
}

function readTickets(): SupportTicket[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        TICKETS_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (
          item,
        ): item is Record<
          string,
          unknown
        > =>
          Boolean(
            item &&
              typeof item ===
                "object",
          ),
      )
      .map(
        (
          item,
        ): SupportTicket => ({
          id:
            typeof item.id ===
            "string"
              ? item.id
              : "",

          creatorId:
            typeof item.creatorId ===
            "string"
              ? item.creatorId
              : "",

          creatorRole:
            isSenderRole(
              item.creatorRole,
            )
              ? item.creatorRole
              : "patient",

          subject:
            typeof item.subject ===
            "string"
              ? item.subject
              : "",

          description:
            typeof item.description ===
            "string"
              ? item.description
              : "",

          category:
            isTicketCategory(
              item.category,
            )
              ? item.category
              : "other",

          priority:
            isTicketPriority(
              item.priority,
            )
              ? item.priority
              : "medium",

          status:
            isTicketStatus(
              item.status,
            )
              ? item.status
              : "open",

          createdAt:
            typeof item.createdAt ===
            "string"
              ? item.createdAt
              : new Date().toISOString(),

          updatedAt:
            typeof item.updatedAt ===
            "string"
              ? item.updatedAt
              : new Date().toISOString(),

          resolvedAt:
            typeof item.resolvedAt ===
            "string"
              ? item.resolvedAt
              : undefined,
        }),
      )
      .filter(
        (ticket) =>
          ticket.id.length > 0 &&
          ticket.creatorId.length > 0,
      );
  } catch {
    return [];
  }
}

function writeTickets(
  tickets: SupportTicket[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    TICKETS_KEY,
    JSON.stringify(tickets),
  );

  window.dispatchEvent(
    new Event(
      "schedula:support-tickets-updated",
    ),
  );
}

function readMessages(): SupportTicketMessage[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        MESSAGES_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (
          item,
        ): item is Record<
          string,
          unknown
        > =>
          Boolean(
            item &&
              typeof item ===
                "object",
          ),
      )
      .map(
        (
          item,
        ): SupportTicketMessage => ({
          id:
            typeof item.id ===
            "string"
              ? item.id
              : "",

          ticketId:
            typeof item.ticketId ===
            "string"
              ? item.ticketId
              : "",

          senderId:
            typeof item.senderId ===
            "string"
              ? item.senderId
              : "",

          senderRole:
            isSenderRole(
              item.senderRole,
            )
              ? item.senderRole
              : "patient",

          message:
            typeof item.message ===
            "string"
              ? item.message
              : "",

          createdAt:
            typeof item.createdAt ===
            "string"
              ? item.createdAt
              : new Date().toISOString(),
        }),
      )
      .filter(
        (message) =>
          message.id.length > 0 &&
          message.ticketId.length > 0 &&
          message.senderId.length > 0 &&
          message.message.length > 0,
      );
  } catch {
    return [];
  }
}

function writeMessages(
  messages: SupportTicketMessage[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    MESSAGES_KEY,
    JSON.stringify(messages),
  );

  window.dispatchEvent(
    new Event(
      "schedula:support-ticket-messages-updated",
    ),
  );
}

function createId(
  prefix: string,
): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function getAllSupportTickets(): SupportTicket[] {
  return readTickets().sort(
    (a, b) =>
      new Date(
        b.updatedAt,
      ).getTime() -
      new Date(
        a.updatedAt,
      ).getTime(),
  );
}

export function getSupportTicketsByUserId(
  userId: string,
): SupportTicket[] {
  return getAllSupportTickets().filter(
    (ticket) =>
      ticket.creatorId === userId,
  );
}

export function getSupportTicketById(
  ticketId: string,
): SupportTicket | null {
  return (
    readTickets().find(
      (ticket) =>
        ticket.id === ticketId,
    ) ?? null
  );
}

export function createSupportTicket({
  creatorId,
  creatorRole,
  subject,
  description,
  category = "other",
  priority = "medium",
}: {
  creatorId: string;
  creatorRole: "patient" | "doctor";
  subject: string;
  description: string;
  category?: SupportTicketCategory;
  priority?: SupportTicketPriority;
}): SupportTicket {
  const now =
    new Date().toISOString();

  const ticket: SupportTicket =
    {
      id: createId(
        "support-ticket",
      ),

      creatorId,
      creatorRole,

      subject:
        subject.trim(),

      description:
        description.trim(),

      category,
      priority,

      status: "open",

      createdAt: now,
      updatedAt: now,
    };

  writeTickets([
    ticket,
    ...readTickets(),
  ]);

  return ticket;
}

export function updateSupportTicket(
  ticketId: string,
  updates: Partial<
    Pick<
      SupportTicket,
      | "subject"
      | "description"
      | "category"
      | "priority"
    >
  >,
): SupportTicket | null {
  const tickets =
    readTickets();

  const existing =
    tickets.find(
      (ticket) =>
        ticket.id === ticketId,
    );

  if (!existing) {
    return null;
  }

  const updatedTicket: SupportTicket =
    {
      ...existing,
      ...updates,

      subject:
        typeof updates.subject ===
        "string"
          ? updates.subject.trim()
          : existing.subject,

      description:
        typeof updates.description ===
        "string"
          ? updates.description.trim()
          : existing.description,

      updatedAt:
        new Date().toISOString(),
    };

  writeTickets(
    tickets.map(
      (ticket) =>
        ticket.id === ticketId
          ? updatedTicket
          : ticket,
    ),
  );

  return updatedTicket;
}

export function updateSupportTicketStatus(
  ticketId: string,
  status: SupportTicketStatus,
): SupportTicket | null {
  const tickets =
    readTickets();

  const existing =
    tickets.find(
      (ticket) =>
        ticket.id === ticketId,
    );

  if (!existing) {
    return null;
  }

  const now =
    new Date().toISOString();

  const updatedTicket: SupportTicket =
    {
      ...existing,

      status,

      updatedAt: now,

      resolvedAt:
        status === "resolved" ||
        status === "closed"
          ? existing.resolvedAt ??
            now
          : undefined,
    };

  writeTickets(
    tickets.map(
      (ticket) =>
        ticket.id === ticketId
          ? updatedTicket
          : ticket,
    ),
  );

  return updatedTicket;
}

export function getSupportTicketMessages(
  ticketId: string,
): SupportTicketMessage[] {
  return readMessages()
    .filter(
      (message) =>
        message.ticketId ===
        ticketId,
    )
    .sort(
      (a, b) =>
        new Date(
          a.createdAt,
        ).getTime() -
        new Date(
          b.createdAt,
        ).getTime(),
    );
}

export function addSupportTicketMessage({
  ticketId,
  senderId,
  senderRole,
  message,
}: {
  ticketId: string;
  senderId: string;
  senderRole: "patient" | "doctor";
  message: string;
}): SupportTicketMessage | null {
  const ticket =
    getSupportTicketById(
      ticketId,
    );

  if (!ticket) {
    return null;
  }

  const trimmedMessage =
    message.trim();

  if (!trimmedMessage) {
    return null;
  }

  const ticketMessage: SupportTicketMessage =
    {
      id: createId(
        "support-message",
      ),

      ticketId,

      senderId,
      senderRole,

      message:
        trimmedMessage,

      createdAt:
        new Date().toISOString(),
    };

  writeMessages([
    ...readMessages(),
    ticketMessage,
  ]);

  updateSupportTicket(
    ticketId,
    {},
  );

  return ticketMessage;
}

export function deleteSupportTicket(
  ticketId: string,
): void {
  const tickets =
    readTickets().filter(
      (ticket) =>
        ticket.id !== ticketId,
    );

  const messages =
    readMessages().filter(
      (message) =>
        message.ticketId !==
        ticketId,
    );

  writeTickets(tickets);
  writeMessages(messages);
}