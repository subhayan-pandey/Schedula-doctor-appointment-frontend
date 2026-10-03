"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";

import Modal from "@/components/admin/ui/Modal";
import { adminToast } from "@/components/admin/ui/toast";

import {
  ADMIN_ROLES,
  addAdminAccount,
  generateAdminAccountId,
  isAdminEmailTaken,
  updateAdminAccount,
  type AdminAccount,
} from "@/lib/admin/admin-accounts-store";
import { formatAdminRole } from "@/lib/admin/admin-roles";
import { logAdminAction } from "@/lib/admin/audit-log-store";

import { useAdminAuth } from "@/context/AdminAuthContext";

import type { AdminRole } from "@/types/admin/admin-user";

const fieldClassName =
  "rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

type AdminUserFormModalProps = {
  open: boolean;
  /** Present = editing this account. Absent/null = adding a new one. */
  account?: AdminAccount | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function AdminUserFormModal({
  open,
  account,
  onClose,
  onSaved,
}: AdminUserFormModalProps) {
  const { adminUser } = useAdminAuth();
  const isEditing = Boolean(account);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("support");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(account?.name ?? "");
    setEmail(account?.email ?? "");
    setPassword("");
    setRole(account?.role ?? "support");
    setErrors({});
  }, [open, account]);

  function handleClose(): void {
    if (isSaving) {
      return;
    }

    onClose();
  }

  async function handleSubmit(): Promise<void> {
    const nextErrors: FieldErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (isAdminEmailTaken(email, account?.id)) {
      nextErrors.email = "An admin with this email already exists.";
    }

    if (!isEditing && password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);

    if (isEditing && account) {
      const patch: Partial<AdminAccount> = {
        name: name.trim(),
        email: email.trim(),
        role,
      };

      if (password.trim()) {
        patch.password = password.trim();
      }

      updateAdminAccount(account.id, patch);

      if (adminUser) {
        logAdminAction({
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: "update",
          entityType: "admin-account",
          entityId: account.id,
          entityLabel: name.trim(),
          description: `${adminUser.name} updated admin account ${name.trim()}`,
        });
      }

      adminToast.success("Admin account updated.");
    } else {
      const newAccount: AdminAccount = {
        id: generateAdminAccountId(),
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        isActive: true,
      };

      addAdminAccount(newAccount);

      if (adminUser) {
        logAdminAction({
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: "create",
          entityType: "admin-account",
          entityId: newAccount.id,
          entityLabel: newAccount.name,
          description: `${adminUser.name} created admin account ${newAccount.name}`,
        });
      }

      adminToast.success("Admin account created.");
    }

    setIsSaving(false);
    onSaved();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="md"
      title={isEditing ? "Edit admin" : "Add admin"}
      closeOnBackdropClick={!isSaving}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving…" : isEditing ? "Save changes" : "Add admin"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin-name" className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Name
          </label>
          <input
            id="admin-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClassName}
          />
          {errors.name && (
            <p className="text-xs font-medium text-[var(--urgent-deep)]">{errors.name}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClassName}
          />
          {errors.email && (
            <p className="text-xs font-medium text-[var(--urgent-deep)]">{errors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {isEditing ? "New password (leave blank to keep current)" : "Password"}
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClassName}
          />
          {errors.password && (
            <p className="text-xs font-medium text-[var(--urgent-deep)]">{errors.password}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin-role" className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Role
          </label>
          <select
            id="admin-role"
            value={role}
            onChange={(event) => setRole(event.target.value as AdminRole)}
            className={fieldClassName}
          >
            {ADMIN_ROLES.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {formatAdminRole(roleOption)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
