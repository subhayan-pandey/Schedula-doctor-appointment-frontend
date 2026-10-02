"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";

import SearchFilter from "@/components/admin/ui/SearchFilter";
import Table, { type TableColumn } from "@/components/admin/ui/Table";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Pagination from "@/components/admin/ui/Pagination";

import ComposeNotificationModal from "@/features/admin-notifications/components/ComposeNotificationModal";
import NotificationDetailModal from "@/features/admin-notifications/components/NotificationDetailModal";

import {
  getAllNotificationsForAdmin,
  getRecipientName,
} from "@/lib/admin/admin-notifications";

import type { AppNotification, NotificationRecipientRole } from "@/types/notification";

const PAGE_SIZE = 8;

type RoleFilter = "all" | NotificationRecipientRole;
type ReadFilter = "all" | "read" | "unread";

const selectClassName =
  "h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--ink)] outline-none transition-colors hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

export default function AdminNotificationsList() {
  // Lazy initializer, same reasoning as every other admin list: this
  // component only ever mounts client-side, past AdminAuthGuard.
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    getAllNotificationsForAdmin(),
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [page, setPage] = useState(1);

  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<AppNotification | null>(null);

  function refresh(): void {
    setNotifications(getAllNotificationsForAdmin());
  }

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      if (roleFilter !== "all" && notification.recipientRole !== roleFilter) {
        return false;
      }

      if (readFilter === "read" && !notification.isRead) {
        return false;
      }

      if (readFilter === "unread" && notification.isRead) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const recipientName = getRecipientName(
        notification.userId,
        notification.recipientRole,
      );

      const haystack =
        `${notification.title} ${notification.message} ${recipientName}`.toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [notifications, search, roleFilter, readFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasActiveFilters = roleFilter !== "all" || readFilter !== "all";

  function handleFiltersChange(): void {
    setPage(1);
  }

  const columns: TableColumn<AppNotification>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <span className="line-clamp-1 max-w-xs">{row.title}</span>
      ),
    },
    {
      key: "recipient",
      header: "Recipient",
      render: (row) => getRecipientName(row.userId, row.recipientRole),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <StatusBadge label={row.recipientRole} tone="neutral" />
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <span className="text-xs text-[var(--muted)]">{row.type}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          label={row.isRead ? "Read" : "Unread"}
          tone={row.isRead ? "neutral" : "brand"}
          withDot
        />
      ),
    },
    {
      key: "sent",
      header: "Sent",
      render: (row) => new Date(row.createdAt).toLocaleDateString("en-IN"),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-24",
      render: (row) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedNotification(row)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] transition-colors hover:bg-[var(--brand-soft)]"
          >
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink)]">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {notifications.length} total
          </p>
        </div>

        <Button type="button" onClick={() => setComposeOpen(true)}>
          Compose notification
        </Button>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          handleFiltersChange();
        }}
        searchPlaceholder="Search by title, message, or recipient…"
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setRoleFilter("all");
          setReadFilter("all");
          handleFiltersChange();
        }}
      >
        <select
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value as RoleFilter);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by recipient role"
        >
          <option value="all">All recipients</option>
          <option value="patient">Patients</option>
          <option value="doctor">Doctors</option>
        </select>

        <select
          value={readFilter}
          onChange={(event) => {
            setReadFilter(event.target.value as ReadFilter);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by read status"
        >
          <option value="all">Read &amp; unread</option>
          <option value="read">Read</option>
          <option value="unread">Unread</option>
        </select>
      </SearchFilter>

      <Table
        columns={columns}
        rows={paginatedNotifications}
        keyExtractor={(row) => row.id}
        emptyTitle="No notifications match these filters"
        emptyDescription="Try adjusting your search or filters."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredNotifications.length}
        pageSize={PAGE_SIZE}
      />

      <NotificationDetailModal
        notification={selectedNotification}
        open={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
      />

      <ComposeNotificationModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSent={refresh}
      />
    </div>
  );
}
