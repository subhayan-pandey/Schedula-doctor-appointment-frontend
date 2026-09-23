"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import NotificationBell from "@/components/ui/NotificationBell";

import { logout } from "@/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/store";

type ThemeChoice = "light" | "dark" | "system";

type NavItem = {
  href: string;
  label: string;
};

const THEME_STORAGE_KEY = "schedula:theme";

const LIGHT_THEME_VARIABLES: Record<string, string> = {
  "--canvas": "#f7fafb",
  "--surface": "#ffffff",
  "--ink": "#12242b",
  "--muted": "#647279",
  "--line": "#e2e8ea",

  "--brand": "#1fb6cc",
  "--brand-deep": "#0e8fa3",
  "--brand-soft": "#e7f8fb",

  "--success": "#17a568",
  "--success-soft": "#e9f9f1",

  "--urgent": "#e23f63",
  "--urgent-deep": "#c22a4c",
  "--urgent-soft": "#fdeef1",

  "--warning": "#b8860b",
  "--warning-soft": "#fdf6e3",
};

const DARK_THEME_VARIABLES: Record<string, string> = {
  "--canvas": "#0f1b20",
  "--surface": "#14262d",
  "--ink": "#f2f8f9",
  "--muted": "#a8b8bd",
  "--line": "#2d4148",

  "--brand": "#1fb6cc",
  "--brand-deep": "#22a9bf",
  "--brand-soft": "#193840",

  "--success": "#23b878",
  "--success-soft": "#15382d",

  "--urgent": "#ed5273",
  "--urgent-deep": "#f06482",
  "--urgent-soft": "#3a2028",

  "--warning": "#d6ad3f",
  "--warning-soft": "#3b321c",
};

const THEME_VARIABLE_KEYS = [
  ...Object.keys(LIGHT_THEME_VARIABLES),
  ...Object.keys(DARK_THEME_VARIABLES),
].filter(
  (value, index, array) =>
    array.indexOf(value) === index,
);

const PATIENT_MAIN_NAV: NavItem[] = [
  {
    href: "/doctors",
    label: "Find Doctors",
  },
  {
    href: "/#how-it-works",
    label: "How it works",
  },
  {
    href: "/appointments",
    label: "My Appointments",
  },
];

const DOCTOR_MAIN_NAV: NavItem[] = [
  {
    href: "/doctor/appointments",
    label: "Appointments",
  },
  {
    href: "/doctor/calendar",
    label: "Calendar",
  },
  {
    href: "/doctor/prescriptions",
    label: "Prescriptions",
  },
];

const PATIENT_ACCOUNT_NAV: NavItem[] = [
  {
    href: "/profile",
    label: "My Profile",
  },
];

const DOCTOR_ACCOUNT_NAV: NavItem[] = [
  {
    href: "/doctor/dashboard",
    label: "Dashboard",
  },
  {
    href: "/doctor/profile",
    label: "My Profile",
  },
];

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function isNavItemActive(
  pathname: string,
  href: string,
) {
  if (href.startsWith("/#")) {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function getStoredTheme(): ThemeChoice {
  if (typeof window === "undefined") {
    return "system";
  }

  const saved =
    window.localStorage.getItem(
      THEME_STORAGE_KEY,
    );

  if (
    saved === "light" ||
    saved === "dark" ||
    saved === "system"
  ) {
    return saved;
  }

  return "system";
}

function setThemeVariables(
  variables: Record<string, string>,
) {
  if (typeof window === "undefined") {
    return;
  }

  const root =
    document.documentElement;

  THEME_VARIABLE_KEYS.forEach(
    (property) => {
      root.style.removeProperty(
        property,
      );
    },
  );

  Object.entries(variables).forEach(
    ([property, value]) => {
      root.style.setProperty(
        property,
        value,
      );
    },
  );
}

function applyTheme(
  theme: ThemeChoice,
) {
  if (typeof window === "undefined") {
    return;
  }

  const root =
    document.documentElement;

  const systemPrefersDark =
    window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

  const effectiveTheme =
    theme === "system"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : theme;

  if (effectiveTheme === "dark") {
    setThemeVariables(
      DARK_THEME_VARIABLES,
    );

    root.style.colorScheme =
      "dark";

    return;
  }

  setThemeVariables(
    LIGHT_THEME_VARIABLES,
  );

  root.style.colorScheme =
    "light";
}

function ThemeIcon({
  theme,
}: {
  theme: ThemeChoice;
}) {
  if (theme === "light") {
    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="4"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (theme === "dark") {
    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M9 20h6M12 16v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="m16 16 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const dispatch =
    useDispatch<AppDispatch>();

  const user =
    useSelector(
      (state: RootState) =>
        state.auth.user,
    );

  const profileMenuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const mobileMenuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    isProfileMenuOpen,
    setIsProfileMenuOpen,
  ] = useState(false);

  const [
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  ] = useState(false);

  const [theme, setTheme] =
    useState<ThemeChoice>(
      "system",
    );

  useEffect(() => {
    Promise.resolve().then(() => {
      setTheme(
        getStoredTheme(),
      );
    });
  }, []);

  useEffect(() => {
    applyTheme(theme);

    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      theme,
    );

    if (theme !== "system") {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    function handleSystemThemeChange() {
      applyTheme("system");
    }

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange,
      );
    };
  }, [theme]);

  useEffect(() => {
    function handlePointerDown(
      event: MouseEvent,
    ) {
      const target =
        event.target;

      if (
        target instanceof Node &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          target,
        )
      ) {
        setIsProfileMenuOpen(
          false,
        );
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setIsProfileMenuOpen(
          false,
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    function handlePointerDown(
      event: MouseEvent,
    ) {
      const target =
        event.target;

      if (
        target instanceof Node &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(
          target,
        )
      ) {
        setIsMobileMenuOpen(
          false,
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
    };
  }, [isMobileMenuOpen]);

  function closeMenus() {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  }

  function handleLogout() {
    dispatch(logout());

    closeMenus();

    router.push("/");
  }

  function handleThemeChange(
    nextTheme: ThemeChoice,
  ) {
    setTheme(nextTheme);
  }

  const isDoctor =
    user?.role === "doctor";

  const mainNavigation =
    isDoctor
      ? DOCTOR_MAIN_NAV
      : PATIENT_MAIN_NAV;

  const accountNavigation =
    isDoctor
      ? DOCTOR_ACCOUNT_NAV
      : PATIENT_ACCOUNT_NAV;

  const initials =
    getInitials(
      user?.name ?? "User",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href="/"
          onClick={closeMenus}
          className="flex shrink-0 items-center gap-2.5"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-[var(--brand)] text-lg font-bold text-white shadow-sm">
            S
          </span>

          <span className="text-lg font-semibold tracking-tight text-[var(--ink)]">
            Schedula
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {mainNavigation.map(
            (item) => {
              const active =
                isNavItemActive(
                  pathname,
                  item.href,
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 text-sm font-medium transition-colors ${
                    active
                      ? "text-[var(--brand-deep)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {item.label}

                  {active && (
                    <span className="absolute inset-x-0 -bottom-[23px] h-0.5 rounded-full bg-[var(--brand)]" />
                  )}
                </Link>
              );
            },
          )}
        </nav>

        <div
          ref={profileMenuRef}
          className="relative flex items-center gap-2"
        >
          {user && (
            <>
              <Link
                href="/search"
                onClick={closeMenus}
                aria-label="Search Schedula"
                className={`grid size-10 place-items-center rounded-lg border transition ${
                  pathname === "/search"
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                    : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                }`}
              >
                <SearchIcon />
              </Link>

              <NotificationBell />
            </>
          )}

          {user ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(
                    (current) =>
                      !current,
                  );

                  setIsMobileMenuOpen(
                    false,
                  );
                }}
                aria-expanded={
                  isProfileMenuOpen
                }
                aria-haspopup="menu"
                className="hidden items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 text-left hover:border-[var(--line)] hover:bg-[var(--canvas)] lg:flex"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                  {initials}
                </span>

                <span className="max-w-36 min-w-0">
                  <span className="block truncate text-sm font-semibold text-[var(--ink)]">
                    {user.name}
                  </span>

                  <span className="block truncate text-xs text-[var(--muted)]">
                    {user.emailOrMobile}
                  </span>
                </span>

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  className={`shrink-0 text-[var(--muted)] transition-transform ${
                    isProfileMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  <path
                    d="m5 7.5 5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(
                    (current) =>
                      !current,
                  );

                  setIsProfileMenuOpen(
                    false,
                  );
                }}
                aria-expanded={
                  isMobileMenuOpen
                }
                aria-controls="mobile-navigation"
                aria-label={
                  isMobileMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                className="grid size-10 place-items-center rounded-lg border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--canvas)] lg:hidden"
              >
                {isMobileMenuOpen ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 6l12 12M18 6 6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6h16M4 12h16M4 18h16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-14 z-50 hidden w-[360px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl lg:block">
                  <div className="flex items-center gap-3.5 px-4 py-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                      {initials}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--ink)]">
                        {user.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                        {user.emailOrMobile}
                      </p>

                      <span className="mt-1.5 inline-flex rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-deep)]">
                        {isDoctor
                          ? "Doctor"
                          : "Patient"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[var(--line)]" />

                  <div className="px-3 py-3">
                    <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                      Account
                    </p>

                    {accountNavigation.map(
                      (item) => {
                        const active =
                          isNavItemActive(
                            pathname,
                            item.href,
                          );

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={
                              closeMenus
                            }
                            className={`mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium first:mt-0 ${
                              active
                                ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                                : "text-[var(--ink)] hover:bg-[var(--canvas)]"
                            }`}
                          >
                            {item.href ===
                            "/doctor/dashboard" ? (
                              <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-3H4v3Z"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}

                            {item.label}
                          </Link>
                        );
                      },
                    )}

                    <Link
                      href="/search"
                      role="menuitem"
                      onClick={() =>
                        setIsProfileMenuOpen(
                          false,
                        )
                      }
                      className={`mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        pathname === "/search"
                          ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                          : "text-[var(--ink)] hover:bg-[var(--canvas)]"
                      }`}
                    >
                      <SearchIcon />
                      Search
                    </Link>

                    <Link
                      href="/settings/notifications"
                      role="menuitem"
                      onClick={() =>
                        setIsProfileMenuOpen(
                          false,
                        )
                      }
                      className={`mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        pathname ===
                        "/settings/notifications"
                          ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                          : "text-[var(--ink)] hover:bg-[var(--canvas)]"
                      }`}
                    >
                      Notifications
                    </Link>

                    <Link
                      href="/support"
                      role="menuitem"
                      onClick={() =>
                        setIsProfileMenuOpen(
                          false,
                        )
                      }
                      className={`mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        pathname === "/support"
                          ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                          : "text-[var(--ink)] hover:bg-[var(--canvas)]"
                      }`}
                    >
                      Support
                    </Link>
                  </div>

                  <div className="border-t border-[var(--line)]" />

                  <div className="px-3 py-3">
                    <p className="px-3 text-sm font-semibold text-[var(--ink)]">
                      Appearance
                    </p>

                    <p className="px-3 pt-0.5 text-xs text-[var(--muted)]">
                      Choose how Schedula looks
                    </p>

                    <div className="mt-2.5 grid grid-cols-3 gap-2">
                      {(
                        [
                          "light",
                          "dark",
                          "system",
                        ] as ThemeChoice[]
                      ).map(
                        (themeOption) => (
                          <button
                            key={
                              themeOption
                            }
                            type="button"
                            onClick={() =>
                              handleThemeChange(
                                themeOption,
                              )
                            }
                            className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition ${
                              theme ===
                              themeOption
                                ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                                : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                            }`}
                            aria-pressed={
                              theme ===
                              themeOption
                            }
                          >
                            <ThemeIcon
                              theme={
                                themeOption
                              }
                            />

                            <span className="capitalize">
                              {
                                themeOption
                              }
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[var(--line)]" />

                  <div className="p-3">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--urgent-deep)] hover:bg-[var(--urgent-soft)]"
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10m5-3 4-4-4-4m4 4H10"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      Log out
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden lg:block"
              >
                <span className="inline-flex rounded-lg border border-[var(--line)] px-3.5 py-2 text-sm font-semibold text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand-deep)]">
                  Log in
                </span>
              </Link>

              <Link href="/signup">
                <span className="inline-flex rounded-lg bg-[var(--brand)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-deep)]">
                  Get started
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      {isMobileMenuOpen &&
        user && (
          <div
            ref={mobileMenuRef}
            id="mobile-navigation"
            className="border-t border-[var(--line)] bg-[var(--surface)] lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-8">
              <div className="flex items-center gap-3 rounded-xl bg-[var(--canvas)] px-3.5 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                  {initials}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--ink)]">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-[var(--muted)]">
                    {user.emailOrMobile}
                  </p>
                </div>

                <span className="ml-auto rounded-full bg-[var(--brand-soft)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-deep)]">
                  {isDoctor
                    ? "Doctor"
                    : "Patient"}
                </span>
              </div>

              <nav className="mt-3 space-y-1">
                {mainNavigation.map(
                  (item) => {
                    const active =
                      isNavItemActive(
                        pathname,
                        item.href,
                      );

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={
                          closeMenus
                        }
                        className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium ${
                          active
                            ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                            : "text-[var(--ink)] hover:bg-[var(--canvas)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  },
                )}

                {accountNavigation.map(
                  (item) => {
                    const active =
                      isNavItemActive(
                        pathname,
                        item.href,
                      );

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={
                          closeMenus
                        }
                        className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium ${
                          active
                            ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                            : "text-[var(--ink)] hover:bg-[var(--canvas)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  },
                )}

                <Link
                  href="/search"
                  onClick={closeMenus}
                  className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium ${
                    pathname === "/search"
                      ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                      : "text-[var(--ink)] hover:bg-[var(--canvas)]"
                  }`}
                >
                  Search
                </Link>

                <Link
                  href="/settings/notifications"
                  onClick={closeMenus}
                  className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium ${
                    pathname ===
                    "/settings/notifications"
                      ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                      : "text-[var(--ink)] hover:bg-[var(--canvas)]"
                  }`}
                >
                  Notification preferences
                </Link>

                <Link
                  href="/support"
                  onClick={closeMenus}
                  className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium ${
                    pathname === "/support"
                      ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                      : "text-[var(--ink)] hover:bg-[var(--canvas)]"
                  }`}
                >
                  Support
                </Link>
              </nav>

              <div className="mt-3 border-t border-[var(--line)] pt-3">
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Appearance
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      "light",
                      "dark",
                      "system",
                    ] as ThemeChoice[]
                  ).map(
                    (themeOption) => (
                      <button
                        key={
                          themeOption
                        }
                        type="button"
                        onClick={() =>
                          handleThemeChange(
                            themeOption,
                          )
                        }
                        className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-semibold capitalize ${
                          theme ===
                          themeOption
                            ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                            : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--canvas)]"
                        }`}
                        aria-pressed={
                          theme ===
                          themeOption
                        }
                      >
                        <ThemeIcon
                          theme={
                            themeOption
                          }
                        />

                        {
                          themeOption
                        }
                      </button>
                    ),
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex w-full items-center rounded-lg px-3 py-3 text-sm font-semibold text-[var(--urgent-deep)] hover:bg-[var(--urgent-soft)]"
              >
                Log out
              </button>
            </div>
          </div>
        )}
    </header>
  );
}