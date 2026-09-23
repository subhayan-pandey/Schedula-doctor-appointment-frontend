"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { FormEvent } from "react";

import Button from "@/components/ui/Button";

import {
  addSupportTicketMessage,
  createSupportTicket,
  getSupportTicketById,
  getSupportTicketMessages,
  getSupportTicketsByUserId,
} from "@/lib/support-ticket-store";
import { getSession } from "@/lib/storage";

import type {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketMessage,
  SupportTicketPriority,
} from "@/types/support-ticket";

const CATEGORIES: Array<{
  value: SupportTicketCategory;
  label: string;
}> = [
  {
    value: "appointment",
    label: "Appointment",
  },
  {
    value: "booking",
    label: "Booking",
  },
  {
    value: "payment",
    label: "Payment",
  },
  {
    value: "doctor",
    label: "Doctor",
  },
  {
    value: "account",
    label: "Account",
  },
  {
    value: "technical",
    label: "Technical",
  },
  {
    value: "other",
    label: "Other",
  },
];

const PRIORITIES: Array<{
  value: SupportTicketPriority;
  label: string;
}> = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
];

function getInitialTickets(): SupportTicket[] {
  const session = getSession();

  if (!session) {
    return [];
  }

  return getSupportTicketsByUserId(
    session.id,
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}

function statusClass(
  status: SupportTicket["status"],
) {
  if (
    status === "resolved" ||
    status === "closed"
  ) {
    return "bg-[var(--success-soft)] text-[var(--success)]";
  }

  if (status === "in-progress") {
    return "bg-[var(--brand-soft)] text-[var(--brand-deep)]";
  }

  return "bg-[var(--warning-soft)] text-[var(--warning)]";
}

function priorityClass(
  priority: SupportTicketPriority,
) {
  if (priority === "high") {
    return "text-[var(--urgent)]";
  }

  if (priority === "medium") {
    return "text-[var(--warning)]";
  }

  return "text-[var(--muted)]";
}

export default function SupportCenter() {
  const [tickets, setTickets] =
    useState<SupportTicket[]>(
      getInitialTickets,
    );

  const [selectedTicketId, setSelectedTicketId] =
    useState<string | null>(null);

  const [messageText, setMessageText] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState<SupportTicketCategory>(
      "appointment",
    );

  const [priority, setPriority] =
    useState<SupportTicketPriority>(
      "medium",
    );

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [sessionId, setSessionId] =
    useState<string | null>(
      () => getSession()?.id ?? null,
    );

  const selectedTicket = useMemo(
    () =>
      selectedTicketId
        ? getSupportTicketById(
            selectedTicketId,
          ) ??
          tickets.find(
            (ticket) =>
              ticket.id ===
              selectedTicketId,
          ) ??
          null
        : null,
    [selectedTicketId, tickets],
  );

  const messages: SupportTicketMessage[] =
    selectedTicketId
      ? getSupportTicketMessages(
          selectedTicketId,
        )
      : [];

  const loadTickets = useCallback(() => {
    try {
      const session = getSession();

      setSessionId(
        session?.id ?? null,
      );

      setTickets(
        session
          ? getSupportTicketsByUserId(
              session.id,
            )
          : [],
      );

      setError(null);
    } catch {
      setError(
        "Support tickets could not be loaded.",
      );
    }
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      loadTickets();
    };

    const handleStorage = (
      event: StorageEvent,
    ) => {
      if (
        !event.key ||
        [
          "schedula:support-tickets",
          "schedula:support-ticket-messages",
          "schedula:session",
        ].includes(event.key)
      ) {
        loadTickets();
      }
    };

    window.addEventListener(
      "schedula:support-tickets-updated",
      handleUpdate,
    );

    window.addEventListener(
      "schedula:support-ticket-messages-updated",
      handleUpdate,
    );

    window.addEventListener(
      "schedula:session-updated",
      handleUpdate,
    );

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      window.removeEventListener(
        "schedula:support-tickets-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "schedula:support-ticket-messages-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "schedula:session-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
  }, [loadTickets]);

  const openTicket = (
    ticketId: string,
  ) => {
    setSelectedTicketId(ticketId);
    setMessageText("");
    setError(null);
    setSuccess(null);
  };

  const handleCreate = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const session = getSession();

    if (!session) {
      setError(
        "Please sign in before creating a support ticket.",
      );
      return;
    }

    if (subject.trim().length < 3) {
      setError(
        "Please enter a subject with at least 3 characters.",
      );
      return;
    }

    if (
      description.trim().length < 10
    ) {
      setError(
        "Please describe the issue in at least 10 characters.",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const ticket =
        createSupportTicket({
          creatorId: session.id,
          creatorRole: session.role,
          subject: subject.trim(),
          description:
            description.trim(),
          category,
          priority,
        });

      setTickets((current) => [
        ticket,
        ...current.filter(
          (item) =>
            item.id !== ticket.id,
        ),
      ]);

      setSelectedTicketId(
        ticket.id,
      );

      setSubject("");
      setDescription("");
      setCategory("appointment");
      setPriority("medium");
      setShowCreateForm(false);

      setSuccess(
        "Support ticket created.",
      );
    } catch {
      setError(
        "The ticket could not be created. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const session = getSession();

    if (
      !session ||
      !selectedTicketId ||
      !messageText.trim()
    ) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      addSupportTicketMessage({
        ticketId: selectedTicketId,
        senderId: session.id,
        senderRole: session.role,
        message: messageText.trim(),
      });

      setMessageText("");

      setSuccess(
        "Reply added.",
      );

      loadTickets();
    } catch {
      setError(
        "Your reply could not be added. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionId) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Support center
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Please sign in to create and view
          support tickets.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Support center
          </h1>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Create a ticket or continue an
            existing support conversation.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setShowCreateForm(
              (current) => !current,
            );

            setSelectedTicketId(
              null,
            );

            setError(null);
            setSuccess(null);
          }}
        >
          {showCreateForm
            ? "View tickets"
            : "Create ticket"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-4 py-3 text-sm text-[var(--urgent-deep)]">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-[var(--success)]/20 bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success)]">
          {success}
        </div>
      ) : null}

      {showCreateForm ? (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
        >
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Create a support ticket
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
                Subject
              </span>

              <input
                value={subject}
                onChange={(event) =>
                  setSubject(
                    event.target.value,
                  )
                }
                placeholder="What do you need help with?"
                className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
                Category
              </span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target
                      .value as SupportTicketCategory,
                  )
                }
                className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              >
                {CATEGORIES.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
                Priority
              </span>

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target
                      .value as SupportTicketPriority,
                  )
                }
                className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              >
                {PRIORITIES.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
                Description
              </span>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                rows={6}
                placeholder="Describe the problem and include any relevant details."
                className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setShowCreateForm(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating…"
                : "Create ticket"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.5fr)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
            <div className="border-b border-[var(--line)] px-5 py-4">
              <h2 className="font-semibold text-[var(--ink)]">
                My tickets
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                {tickets.length} ticket
                {tickets.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            {tickets.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-[var(--ink)]">
                  No support tickets yet
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Create a ticket when you
                  need help.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--line)]">
                {tickets.map(
                  (ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() =>
                        openTicket(
                          ticket.id,
                        )
                      }
                      className={`w-full px-5 py-4 text-left transition hover:bg-[var(--canvas)] ${
                        selectedTicketId ===
                        ticket.id
                          ? "bg-[var(--brand-soft)]"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 truncate text-sm font-medium text-[var(--ink)]">
                          {ticket.subject}
                        </span>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${statusClass(
                            ticket.status,
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-[var(--muted)]">
                        {ticket.category} ·{" "}
                        {formatDate(
                          ticket.updatedAt,
                        )}
                      </p>
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
            {!selectedTicket ? (
              <div className="flex min-h-[360px] items-center justify-center px-6 text-center">
                <div>
                  <p className="text-sm font-medium text-[var(--ink)]">
                    Select a ticket
                  </p>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Ticket details and replies
                    will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-[var(--line)] px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                        Support ticket
                      </p>

                      <h2 className="mt-1 text-lg font-semibold text-[var(--ink)]">
                        {
                          selectedTicket.subject
                        }
                      </h2>

                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Created{" "}
                        {formatDate(
                          selectedTicket.createdAt,
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                          selectedTicket.status,
                        )}`}
                      >
                        {
                          selectedTicket.status
                        }
                      </span>

                      <span
                        className={`text-xs font-medium ${priorityClass(
                          selectedTicket.priority,
                        )}`}
                      >
                        {
                          selectedTicket.priority
                        }{" "}
                        priority
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-5 sm:px-6">
                  <div className="rounded-xl bg-[var(--canvas)] p-4">
                    <p className="text-xs font-medium text-[var(--muted)]">
                      Original request
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--ink)]">
                      {
                        selectedTicket.description
                      }
                    </p>
                  </div>

                  {messages.length >
                  0 ? (
                    <div className="space-y-3">
                      {messages.map(
                        (message) => (
                          <div
                            key={
                              message.id
                            }
                            className="rounded-xl border border-[var(--line)] p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-medium text-[var(--muted)]">
                                {message.senderRole ===
                                "doctor"
                                  ? "Doctor"
                                  : "You"}
                              </span>

                              <span className="text-xs text-[var(--muted)]">
                                {formatDate(
                                  message.createdAt,
                                )}
                              </span>
                            </div>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--ink)]">
                              {
                                message.message
                              }
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  ) : null}

                  {selectedTicket.status !==
                    "closed" &&
                  selectedTicket.status !==
                    "resolved" ? (
                    <form
                      onSubmit={
                        handleReply
                      }
                      className="border-t border-[var(--line)] pt-4"
                    >
                      <label
                        htmlFor="support-reply"
                        className="mb-1.5 block text-sm font-medium text-[var(--ink)]"
                      >
                        Add a reply
                      </label>

                      <textarea
                        id="support-reply"
                        value={messageText}
                        onChange={(
                          event,
                        ) =>
                          setMessageText(
                            event.target
                              .value,
                          )
                        }
                        rows={4}
                        placeholder="Write your reply…"
                        className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
                      />

                      <div className="mt-3 flex justify-end">
                        <Button
                          type="submit"
                          disabled={
                            isSubmitting ||
                            !messageText.trim()
                          }
                        >
                          {isSubmitting
                            ? "Sending…"
                            : "Send reply"}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="border-t border-[var(--line)] pt-4 text-sm text-[var(--muted)]">
                      This ticket is{" "}
                      {
                        selectedTicket.status
                      }{" "}
                      and no longer accepts
                      replies.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--muted)]">
        Need to return to your appointments?{" "}
        <Link
          href="/appointments"
          className="font-medium text-[var(--brand-deep)] hover:underline"
        >
          View appointments
        </Link>
      </p>
    </section>
  );
}