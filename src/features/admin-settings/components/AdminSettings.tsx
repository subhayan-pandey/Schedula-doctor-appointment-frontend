"use client";

import { useState, type ReactNode } from "react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { adminToast } from "@/components/admin/ui/toast";

import { useAdminAuth } from "@/context/AdminAuthContext";

import {
  getAdminNotificationPreferences,
  getPlatformSettings,
  saveAdminNotificationPreferences,
  savePlatformSettings,
  type AdminNotificationPreferences,
  type PlatformSettings,
} from "@/lib/admin/admin-settings-store";

import {
  getAdminAccountById,
  isAdminEmailTaken,
  updateAdminAccount,
} from "@/lib/admin/admin-accounts-store";
import { logAdminAction } from "@/lib/admin/audit-log-store";
import { hasAdminPermission } from "@/lib/admin/admin-permissions";
import { setAdminSession } from "@/lib/admin/admin-session-store";

import type { AuditLogAction } from "@/types/admin/audit-log";
import type { AdminUser } from "@/types/admin/admin-user";

const fieldClassName =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <div>
        <h2 className="text-base font-semibold text-[var(--ink)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function PreferenceToggle({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-[var(--line)] px-4 py-3 transition-colors hover:border-[var(--brand)]/30">
      <span>
        <span className="block text-sm font-medium text-[var(--ink)]">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-[var(--muted)]">
          {description}
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 accent-[var(--brand)]"
      />
    </label>
  );
}

export default function AdminSettings() {
  const { adminUser } = useAdminAuth();

  if (!adminUser) {
    return null;
  }

  return <AdminSettingsForm key={adminUser.id} adminUser={adminUser} />;
}

function AdminSettingsForm({ adminUser }: { adminUser: AdminUser }) {
  const [name, setName] = useState(adminUser.name);
  const [email, setEmail] = useState(adminUser.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferences, setPreferences] =
    useState<AdminNotificationPreferences>(() =>
      getAdminNotificationPreferences(adminUser.id),
    );
  const [platform, setPlatform] = useState<PlatformSettings>(() =>
    getPlatformSettings(),
  );
  const [pendingConfirmation, setPendingConfirmation] = useState<
    "password" | "platform" | null
  >(null);

  const canEditSettings = hasAdminPermission(adminUser, "settings", "edit");
  const canEditPlatform = hasAdminPermission(
    adminUser,
    "platformSettings",
    "edit",
  );

  function logSettingsAction(
    action: AuditLogAction,
    description: string,
  ): void {
    logAdminAction({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action,
      entityType: "admin-settings",
      entityId: adminUser.id,
      entityLabel: adminUser.name,
      description,
    });
  }

  function handleSaveProfile(): void {
    if (!name.trim() || !email.trim()) {
      adminToast.error("Name and email are required.");
      return;
    }

    if (isAdminEmailTaken(email, adminUser.id)) {
      adminToast.error("An admin with this email already exists.");
      return;
    }

    const updated = updateAdminAccount(adminUser.id, {
      name: name.trim(),
      email: email.trim(),
    });

    if (!updated) {
      adminToast.error("Could not save your profile. Please try again.");
      return;
    }

    setAdminSession({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
    });

    logSettingsAction(
      "update",
      `${adminUser.name} updated their admin profile`,
    );
    adminToast.success("Profile updated.");
  }

  function requestPasswordChange(): void {
    if (!currentPassword || newPassword.length < 6) {
      adminToast.error(
        "Enter your current password and a new password of at least 6 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      adminToast.error("New passwords do not match.");
      return;
    }

    const account = getAdminAccountById(adminUser.id);

    if (!account || account.password !== currentPassword) {
      adminToast.error("Your current password is incorrect.");
      return;
    }

    setPendingConfirmation("password");
  }

  function handleConfirmPasswordChange(): void {
    const updated = updateAdminAccount(adminUser.id, {
      password: newPassword,
    });

    if (!updated) {
      adminToast.error("Could not update your password. Please try again.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPendingConfirmation(null);

    logSettingsAction(
      "update",
      `${adminUser.name} updated their admin password`,
    );
    adminToast.success("Password updated.");
  }

  function handleSavePreferences(): void {
    saveAdminNotificationPreferences(adminUser.id, preferences);

    logSettingsAction(
      "update",
      `${adminUser.name} updated notification preferences`,
    );
    adminToast.success("Notification preferences saved.");
  }

  function requestPlatformSave(): void {
    if (!platform.platformName.trim() || !platform.supportEmail.trim()) {
      adminToast.error("Platform name and support email are required.");
      return;
    }

    setPendingConfirmation("platform");
  }

  function handleConfirmPlatformSave(): void {
    savePlatformSettings({
      ...platform,
      platformName: platform.platformName.trim(),
      supportEmail: platform.supportEmail.trim(),
    });

    setPendingConfirmation(null);

    logSettingsAction(
      "update",
      `${adminUser.name} updated platform settings`,
    );
    adminToast.success("Platform settings saved.");
  }

  function handleConfirmation(): void {
    if (pendingConfirmation === "password") {
      handleConfirmPasswordChange();
      return;
    }

    if (pendingConfirmation === "platform") {
      handleConfirmPlatformSave();
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ink)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage your admin account and portal preferences.
        </p>
      </div>

      <SettingsCard
        title="Admin profile"
        description="Update the name and email used for this admin account."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={fieldClassName}
              disabled={!canEditSettings}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClassName}
              disabled={!canEditSettings}
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSaveProfile}
            disabled={!canEditSettings}
          >
            Save profile
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Password"
        description="Use a unique password to keep this admin account secure."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className={fieldClassName}
            disabled={!canEditSettings}
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className={fieldClassName}
            disabled={!canEditSettings}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={fieldClassName}
            disabled={!canEditSettings}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={requestPasswordChange}
            disabled={!canEditSettings}
          >
            Update password
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Notifications"
        description="Choose which admin updates you want to receive."
      >
        <div className="flex flex-col gap-2">
          <PreferenceToggle
            checked={preferences.loginAlerts}
            label="Login alerts"
            description="Notify me about new sign-ins to my admin account."
            onChange={(loginAlerts) =>
              setPreferences((current) => ({
                ...current,
                loginAlerts,
              }))
            }
          />
          <PreferenceToggle
            checked={preferences.approvalUpdates}
            label="Approval updates"
            description="Notify me when verification work is completed."
            onChange={(approvalUpdates) =>
              setPreferences((current) => ({
                ...current,
                approvalUpdates,
              }))
            }
          />
          <PreferenceToggle
            checked={preferences.systemUpdates}
            label="System updates"
            description="Notify me about platform maintenance and product updates."
            onChange={(systemUpdates) =>
              setPreferences((current) => ({
                ...current,
                systemUpdates,
              }))
            }
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSavePreferences}
            disabled={!canEditSettings}
          >
            Save preferences
          </Button>
        </div>
      </SettingsCard>

      {canEditPlatform && (
        <SettingsCard
          title="Platform settings"
          description="Basic settings used across the admin portal."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Platform name
              <input
                value={platform.platformName}
                onChange={(event) =>
                  setPlatform((current) => ({
                    ...current,
                    platformName: event.target.value,
                  }))
                }
                className={fieldClassName}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Support email
              <input
                type="email"
                value={platform.supportEmail}
                onChange={(event) =>
                  setPlatform((current) => ({
                    ...current,
                    supportEmail: event.target.value,
                  }))
                }
                className={fieldClassName}
              />
            </label>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
            <input
              type="checkbox"
              checked={platform.maintenanceMode}
              onChange={(event) =>
                setPlatform((current) => ({
                  ...current,
                  maintenanceMode: event.target.checked,
                }))
              }
              className="size-4 accent-[var(--brand)]"
            />
            Maintenance mode
          </label>

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={requestPlatformSave}
            >
              Save platform settings
            </Button>
          </div>
        </SettingsCard>
      )}

      <ConfirmDialog
        open={pendingConfirmation !== null}
        onClose={() => setPendingConfirmation(null)}
        onConfirm={handleConfirmation}
        title={
          pendingConfirmation === "password"
            ? "Update your password?"
            : "Save platform settings?"
        }
        description={
          pendingConfirmation === "password"
            ? "You will use the new password the next time you sign in."
            : "These settings affect the shared admin portal."
        }
        confirmLabel={
          pendingConfirmation === "password"
            ? "Update password"
            : "Save settings"
        }
      />
    </div>
  );
}