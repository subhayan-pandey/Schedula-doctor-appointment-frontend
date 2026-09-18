"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference =
  | "light"
  | "dark"
  | "system";

export type ResolvedTheme =
  | "light"
  | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (
    theme: ThemePreference,
  ) => void;
};

const THEME_KEY =
  "schedula:theme";

const ThemeContext =
  createContext<
    ThemeContextValue | undefined
  >(undefined);

function isThemePreference(
  value: string | null,
): value is ThemePreference {
  return (
    value === "light" ||
    value === "dark" ||
    value === "system"
  );
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

function resolveTheme(
  theme: ThemePreference,
): ResolvedTheme {
  if (theme === "dark") {
    return "dark";
  }

  if (theme === "light") {
    return "light";
  }

  return getSystemTheme();
}

function applyTheme(
  theme: ResolvedTheme,
) {
  document.documentElement.dataset.theme =
    theme;

  document.documentElement.style.colorScheme =
    theme;
}

function getStoredTheme(): ThemePreference {
  try {
    const stored =
      window.localStorage.getItem(
        THEME_KEY,
      );

    if (
      isThemePreference(stored)
    ) {
      return stored;
    }
  } catch {
    // Fall back to system preference.
  }

  return "system";
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<ThemePreference>(
      "system",
    );

  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedTheme>(
      "light",
    );

  const setTheme = useCallback(
    (
      nextTheme: ThemePreference,
    ) => {
      const nextResolvedTheme =
        resolveTheme(nextTheme);

      setThemeState(
        nextTheme,
      );

      setResolvedTheme(
        nextResolvedTheme,
      );

      applyTheme(
        nextResolvedTheme,
      );

      try {
        window.localStorage.setItem(
          THEME_KEY,
          nextTheme,
        );
      } catch {
        // Ignore storage failures.
      }
    },
    [],
  );

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    Promise.resolve().then(() => {
      const storedTheme =
        getStoredTheme();

      const nextResolvedTheme =
        resolveTheme(
          storedTheme,
        );

      setThemeState(
        storedTheme,
      );

      setResolvedTheme(
        nextResolvedTheme,
      );

      applyTheme(
        nextResolvedTheme,
      );
    });

    function handleSystemThemeChange() {
      const storedTheme =
        getStoredTheme();

      if (
        storedTheme !== "system"
      ) {
        return;
      }

      const nextResolvedTheme =
        getSystemTheme();

      setResolvedTheme(
        nextResolvedTheme,
      );

      applyTheme(
        nextResolvedTheme,
      );
    }

    function handleStorageChange(
      event: StorageEvent,
    ) {
      if (
        event.key !== THEME_KEY
      ) {
        return;
      }

      const nextTheme =
        isThemePreference(
          event.newValue,
        )
          ? event.newValue
          : "system";

      const nextResolvedTheme =
        resolveTheme(
          nextTheme,
        );

      setThemeState(
        nextTheme,
      );

      setResolvedTheme(
        nextResolvedTheme,
      );

      applyTheme(
        nextResolvedTheme,
      );
    }

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange,
    );

    window.addEventListener(
      "storage",
      handleStorageChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange,
      );

      window.removeEventListener(
        "storage",
        handleStorageChange,
      );
    };
  }, []);

  const value =
    useMemo(
      () => ({
        theme,
        resolvedTheme,
        setTheme,
      }),
      [
        theme,
        resolvedTheme,
        setTheme,
      ],
    );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}