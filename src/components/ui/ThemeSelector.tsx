"use client";

import {
  useTheme,
  type ThemePreference,
} from "@/context/ThemeContext";

const options: {
  value: ThemePreference;
  label: string;
  description: string;
}[] = [
  {
    value: "light",
    label: "Light",
    description:
      "Always use light mode",
  },
  {
    value: "dark",
    label: "Dark",
    description:
      "Always use dark mode",
  },
  {
    value: "system",
    label: "System",
    description:
      "Follow your device setting",
  },
];

function ThemeIcon({
  theme,
}: {
  theme: ThemePreference;
}) {
  if (theme === "light") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="4"
        />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    );
  }

  if (theme === "dark") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="14"
        rx="2"
      />
      <path d="M8 21h8" />
      <path d="M12 18v3" />
    </svg>
  );
}

export default function ThemeSelector() {
  const {
    theme,
    setTheme,
  } = useTheme();

  return (
    <div>
      <div className="mb-2">
        <p className="text-xs font-semibold text-[var(--ink)]">
          Appearance
        </p>

        <p className="mt-0.5 text-xs text-[var(--muted)]">
          Choose how Schedula looks
        </p>
      </div>

      <div
        role="group"
        aria-label="Appearance"
        className="grid grid-cols-3 gap-1.5"
      >
        {options.map(
          (option) => {
            const isSelected =
              theme ===
              option.value;

            return (
              <button
                key={
                  option.value
                }
                type="button"
                aria-pressed={
                  isSelected
                }
                title={
                  option.description
                }
                onClick={() =>
                  setTheme(
                    option.value,
                  )
                }
                className={`flex min-w-0 flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center text-xs font-medium transition ${
                  isSelected
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                }`}
              >
                <ThemeIcon
                  theme={
                    option.value
                  }
                />

                <span>
                  {
                    option.label
                  }
                </span>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}