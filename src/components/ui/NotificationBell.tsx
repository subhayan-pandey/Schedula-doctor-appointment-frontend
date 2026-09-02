"use client";

import Link from "next/link";
import {
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
) {
  const date = new Date(value);

  const difference =
    Date.now() -
    date.getTime();

  const minutes =
    Math.floor(
      difference / 60000,
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
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
  switch (notification.type) {
    case "confirmation":
      return "✓";

    case "cancellation":
      return "×";

    case "prescription":
      return "📄";

    case "appointment":
      return "📅";

    default:
      return "•";
  }
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] =
    useState(false);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [
    notifications,
    setNotifications,
  ] = useState<AppNotification[]>(
    [],
  );

  const containerRef =
    useRef<HTMLDivElement>(null);

  function refreshNotifications(
    currentUserId?: string | null,
  ) {
    const id =
      currentUserId ?? userId;

    if (!id) {
      setNotifications([]);
      return;
    }

    setNotifications(
      getNotificationsByUserId(
        id,
      ),
    );
  }

  useEffect(() => {
    Promise.resolve().then(() => {
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

    function handleUpdate() {
      const session =
        getSession();

      if (!session) {
        return;
      }

      refreshNotifications(
        session.id,
      );
    }

    window.addEventListener(
      "schedula:notifications-updated",
      handleUpdate,
    );

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

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      window.removeEventListener(
        "schedula:notifications-updated",
        handleUpdate,
      );

      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

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

    refreshNotifications();

    setIsOpen(false);
  }

  function handleMarkAllAsRead() {
    if (!userId) {
      return;
    }

    markAllNotificationsAsRead(
      userId,
    );

    refreshNotifications(userId);
  }

  /*
    Do not render until the component has
    mounted and the browser session has
    been read safely.
  */
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
        className="relative grid size-10 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
        aria-label="Notifications"
      >
        <span className="text-xl">
          🔔
        </span>

        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 grid min-w-5 place-items-center rounded-full bg-[var(--urgent)] px-1 py-0.5 text-[10px] font-semibold text-white">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
            <div>
              <p className="font-semibold text-[var(--ink)]">
                Notifications
              </p>

              <p className="text-xs text-[var(--muted)]">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  handleMarkAllAsRead
                }
                className="text-xs font-medium text-[var(--brand-deep)] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length ===
            0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-[var(--ink)]">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Appointment updates will
                  appear here.
                </p>
              </div>
            ) : (
              notifications.map(
                (notification) => {
                  const content = (
                    <div
                      className={`flex gap-3 border-b border-[var(--line)] px-4 py-4 transition hover:bg-[var(--canvas)] ${
                        !notification.isRead
                          ? "bg-[var(--brand-soft)]/30"
                          : ""
                      }`}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--canvas)] text-sm">
                        {getNotificationIcon(
                          notification,
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-[var(--ink)]">
                            {
                              notification.title
                            }
                          </p>

                          {!notification.isRead && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--brand)]" />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                          {
                            notification.message
                          }
                        </p>

                        <p className="mt-2 text-[11px] text-[var(--muted)]">
                          {formatNotificationTime(
                            notification.createdAt,
                          )}
                        </p>
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
                      className="block w-full text-left"
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