"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";

import SearchFilter from "@/components/admin/ui/SearchFilter";
import Table, { type TableColumn } from "@/components/admin/ui/Table";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Pagination from "@/components/admin/ui/Pagination";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { adminToast } from "@/components/admin/ui/toast";

import AdminUserFormModal from "@/features/admin-admin-users/components/AdminUserFormModal";
import AdminUserDetailModal from "@/features/admin-admin-users/components/AdminUserDetailModal";

import {
  ADMIN_ROLES,
  getAdminAccounts,
  updateAdminAccount,
  type AdminAccount,
} from "@/lib/admin/admin-accounts-store";
import { formatAdminRole, getAdminRoleTone } from "@/lib/admin/admin-roles";
import { logAdminAction } from "@/lib/admin/audit-log-store";

import { useAdminAuth } from "@/context/AdminAuthContext";

import type { AdminRole } from "@/types/admin/admin-user";

const PAGE_SIZE = 8;

type RoleFilter = "all" | AdminRole;
type StatusFilter = "all" | "active" | "inactive";

const selectClassName =
  "h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--ink)] outline-none transition-colors hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

export default function AdminUsersList() {
  const { adminUser } = useAdminAuth();

  // Lazy initializer, same reasoning as every other admin list: this
  // component only ever mounts client-side, past AdminAuthGuard.
  const [accounts, setAccounts] = useState<AdminAccount[]>(() =>
    getAdminAccounts(),
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [formTarget, setFormTarget] = useState<{
    open: boolean;
    account: AdminAccount | null;
  }>({ open: false, account: null });
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(
    null,
  );
  const [confirmTarget, setConfirmTarget] = useState<AdminAccount | null>(
    null,
  );

  function refresh(): void {
    setAccounts(getAdminAccounts());
  }

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const isActive = account.isActive !== false;

      if (roleFilter !== "all" && account.role !== roleFilter) {
        return false;
      }

      if (statusFilter === "active" && !isActive) {
        return false;
      }

      if (statusFilter === "inactive" && isActive) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${account.name} ${account.email}`.toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [accounts, search, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasActiveFilters = roleFilter !== "all" || statusFilter !== "all";

  function handleFiltersChange(): void {
    setPage(1);
  }

  function handleRequestToggleActive(account: AdminAccount): void {
    if (account.id === adminUser?.id) {
      adminToast.error("You can't deactivate your own account.");
      return;
    }

    setSelectedAccount(null);
    setConfirmTarget(account);
  }

  function handleConfirmToggle(): void {
    if (!confirmTarget || !adminUser) {
      return;
    }

    const nextIsActive = confirmTarget.isActive === false;

    const updated = updateAdminAccount(confirmTarget.id, {
      isActive: nextIsActive,
    });

    if (!updated) {
      adminToast.error("Could not update this admin. Please try again.");
      setConfirmTarget(null);
      return;
    }

    logAdminAction({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: nextIsActive ? "activate" : "deactivate",
      entityType: "admin-account",
      entityId: confirmTarget.id,
      entityLabel: confirmTarget.name,
      description: `${adminUser.name} ${
        nextIsActive ? "activated" : "deactivated"
      } admin account ${confirmTarget.name}`,
    });

    adminToast.success(
      `${confirmTarget.name} is now ${nextIsActive ? "active" : "inactive"}.`,
    );

    setConfirmTarget(null);
    refresh();
  }

  const columns: TableColumn<AdminAccount>[] = [
    {
      key: "admin",
      header: "Admin",
      render: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-[var(--muted)]">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <StatusBadge label={formatAdminRole(row.role)} tone={getAdminRoleTone(row.role)} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          label={row.isActive !== false ? "Active" : "Inactive"}
          tone={row.isActive !== false ? "success" : "neutral"}
          withDot
        />
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-24",
      render: (row) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedAccount(row)}
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
            Admin Users
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {accounts.length} total
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setFormTarget({ open: true, account: null })}
        >
          Add admin
        </Button>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          handleFiltersChange();
        }}
        searchPlaceholder="Search by name or email…"
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setRoleFilter("all");
          setStatusFilter("all");
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
          aria-label="Filter by role"
        >
          <option value="all">All roles</option>
          {ADMIN_ROLES.map((role) => (
            <option key={role} value={role}>
              {formatAdminRole(role)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as StatusFilter);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </SearchFilter>

      <Table
        columns={columns}
        rows={paginatedAccounts}
        keyExtractor={(row) => row.id}
        emptyTitle="No admins match these filters"
        emptyDescription="Try adjusting your search or filters."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredAccounts.length}
        pageSize={PAGE_SIZE}
      />

      <AdminUserDetailModal
        account={selectedAccount}
        open={selectedAccount !== null}
        isSelf={selectedAccount?.id === adminUser?.id}
        onClose={() => setSelectedAccount(null)}
        onRequestEdit={(account) => {
          setSelectedAccount(null);
          setFormTarget({ open: true, account });
        }}
        onRequestToggleActive={handleRequestToggleActive}
      />

      <AdminUserFormModal
        open={formTarget.open}
        account={formTarget.account}
        onClose={() => setFormTarget({ open: false, account: null })}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmToggle}
        title={
          confirmTarget
            ? `${confirmTarget.isActive === false ? "Activate" : "Deactivate"} ${confirmTarget.name}?`
            : ""
        }
        description={
          confirmTarget?.isActive === false
            ? "This admin will be able to log in again."
            : "This admin will no longer be able to log in while inactive."
        }
        confirmLabel={confirmTarget?.isActive === false ? "Activate" : "Deactivate"}
        tone={confirmTarget?.isActive === false ? "neutral" : "danger"}
      />
    </div>
  );
}
