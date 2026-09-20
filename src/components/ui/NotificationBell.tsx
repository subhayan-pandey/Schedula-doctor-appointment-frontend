"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getNotificationsByUserId,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notifications-store";

import {
  getSession,
} from "@/lib/storage";

import type {
  AppNotification,
} from "@/types/notification";

function formatNotificationTime(
  value: string,
): string {
  const date = new Date(value);

  const difference =
    Date.now() -
    date.getTime();

  const minutes = Math.floor(
    difference / 60000,
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    },
  );
}

function getNotificationIcon(
  notification: AppNotification,
) {
  const iconClass = "size-4";

  switch (notification.type) {
    case "confirmation":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={iconClass}
          aria-hidden="true"
        >
          <path
            d="m5 12 4 4L19 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "cancellation":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={iconClass}
          aria-hidden="true"
        >
          <path
            d="M6 6l12 12M18 6 6 18"
            strokeLinecap="round"
          />
        </svg>
      );

    case "prescription":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={iconClass}
          aria-hidden="true"
        >
          <path
            d="M7 3.5h7l4 4V20.5H7z"
            strokeLinejoin="round"
          />

          <path
            d="M14 3.5v4h4M9.5 12h5M9.5 15h5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "appointment":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={iconClass}
          aria-hidden="true"
        >
          <rect
            x="4"
            y="5"
            width="16"
            height="15"
            rx="2"
          />

          <path
            d="M8 3.5v3M16 3.5v3M4 9h16"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={iconClass}
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="8.5"
          />

          <path
            d="M12 10.5v5M12 7.5h.01"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

function getNotificationIconClasses(
  notification: AppNotification,
): string {
  switch (notification.type) {
    case "confirmation":
      return "bg-[var(--success-soft)] text-[var(--success)]";

    case "cancellation":
      return "bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";

    case "prescription":
      return "bg-[var(--brand-soft)] text-[var(--brand-deep)]";

    case "appointment":
      return "bg-[var(--warning-soft)] text-[var(--warning)]";

    default:
      return "bg-[var(--canvas)] text-[var(--muted)]";
  }
}

export default function NotificationBell() {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    userId,
    setUserId,
  ] = useState<string | null>(null);

  const [
    notifications,
    setNotifications,
  ] = useState<AppNotification[]>(
    [],
  );

  const containerRef =
    useRef<HTMLDivElement>(null);

  /*
   * Refresh notifications for an explicit
   * user ID rather than reading userId from
   * the callback closure.
   */
  const refreshNotifications =
    useCallback(
      (currentUserId: string | null) => {
        if (!currentUserId) {
          setNotifications([]);
          return;
        }

        setNotifications(
          getNotificationsByUserId(
            currentUserId,
          ),
        );
      },
      [],
    );

  useEffect(() => {
    let cancelled = false;

    /*
     * Defer the initial state synchronization.
     *
     * This keeps the effect focused on synchronizing
     * with the external session/notification stores
     * while avoiding React's synchronous-setState-
     * inside-effect lint rule.
     */
    Promise.resolve().then(() => {
      if (cancelled) {
        return;
      }

      const session =
        getSession();

      if (!session) {
        setUserId(null);
        setNotifications([]);
        return;
      }

      setUserId(session.id);

      refreshNotifications(
        session.id,
      );
    });

    /*
     * React to notification-store updates.
     */
    function handleUpdate() {
      const session =
        getSession();

      if (!session) {
        setUserId(null);
        setNotifications([]);
        return;
      }

      setUserId(session.id);

      refreshNotifications(
        session.id,
      );
    }

    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setIsOpen(false);
      }
    }

    window.addEventListener(
      "schedula:notifications-updated",
      handleUpdate,
    );

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "schedula:notifications-updated",
        handleUpdate,
      );

      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    refreshNotifications,
  ]);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead,
    ).length;

  function handleNotificationClick(
    notification: AppNotification,
  ) {
    if (!notification.isRead) {
      markNotificationAsRead(
        notification.id,
      );
    }

    refreshNotifications(
      userId,
    );

    setIsOpen(false);
  }

  function handleMarkAllAsRead() {
    if (!userId) {
      return;
    }

    markAllNotificationsAsRead(
      userId,
    );

    refreshNotifications(
      userId,
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (value) => !value,
          )
        }
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`relative grid size-10 place-items-center rounded-xl border transition-colors ${
          isOpen
            ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-deep)]"
            : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-5"
          aria-hidden="true"
        >
          <path
            d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M10 21h4"
            strokeLinecap="round"
          />
        </svg>

        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full border-2 border-[var(--surface)] bg-[var(--urgent)] px-1 py-0.5 text-[10px] font-bold leading-none text-white"
          >
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-12 z-50 w-[min(390px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_50px_rgba(18,36,43,0.14)]"
        >
          <div className="border-b border-[var(--line)] px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[var(--ink)]">
                    Notifications
                  </h2>

                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[var(--urgent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--urgent-deep)]">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  {unreadCount > 0
                    ? "Review your latest updates."
                    : "You're all caught up."}
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={
                    handleMarkAllAsRead
                  }
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--brand-deep)] transition-colors hover:bg-[var(--brand-soft)]"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[430px] overflow-y-auto">
            {notifications.length ===
            0 ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path
                      d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M10 21h4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p className="mt-4 text-sm font-semibold text-[var(--ink)]">
                  No notifications
                </p>

                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[var(--muted)]">
                  Appointment confirmations,
                  cancellations, and prescription
                  updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map(
                (notification) => {
                  const content = (
                    <div
                      className={`flex gap-3 border-b border-[var(--line)] px-4 py-4 transition-colors sm:px-5 ${
                        notification.isRead
                          ? "bg-[var(--surface)] hover:bg-[var(--canvas)]"
                          : "bg-[var(--brand-soft)]/40 hover:bg-[var(--brand-soft)]/65"
                      }`}
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-xl ${getNotificationIconClasses(
                          notification,
                        )}`}
                      >
                        {getNotificationIcon(
                          notification,
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-5 ${
                              notification.isRead
                                ? "font-medium"
                                : "font-semibold"
                            } text-[var(--ink)]`}
                          >
                            {
                              notification.title
                            }
                          </p>

                          {!notification.isRead && (
                            <span
                              className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--brand)]"
                              aria-label="Unread"
                            />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {
                            notification.message
                          }
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[11px] font-medium text-[var(--muted)]">
                            {formatNotificationTime(
                              notification.createdAt,
                            )}
                          </span>

                          {notification.appointmentId && (
                            <>
                              <span
                                className="size-1 rounded-full bg-[var(--line)]"
                                aria-hidden="true"
                              />

                              <span className="text-[11px] font-semibold text-[var(--brand-deep)]">
                                View appointment
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  if (
                    notification.appointmentId
                  ) {
                    return (
                      <Link
                        key={
                          notification.id
                        }
                        href={`/appointments/${notification.appointmentId}`}
                        onClick={() =>
                          handleNotificationClick(
                            notification,
                          )
                        }
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={
                        notification.id
                      }
                      type="button"
                      className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]"
                      onClick={() =>
                        handleNotificationClick(
                          notification,
                        )
                      }
                    >
                      {content}
                    </button>
                  );
                },
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}