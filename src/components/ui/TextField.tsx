import type { InputHTMLAttributes } from "react";

type TextFieldProps =
  InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  };

export default function TextField({
  label,
  error,
  id,
  ...props
}: TextFieldProps) {
  const errorId = id
    ? `${id}-error`
    : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[var(--ink)]"
      >
        {label}
      </label>

      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-11 w-full rounded-lg border bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] transition-all duration-200 focus:ring-2 focus:ring-[var(--brand-soft)] ${
          error
            ? "border-[var(--urgent)] focus:border-[var(--urgent)]"
            : "border-[var(--line)] hover:border-[var(--brand)]/40 focus:border-[var(--brand)]"
        }`}
        {...props}
      />

      {error && (
        <p
          id={errorId}
          className="text-xs font-medium text-[var(--urgent-deep)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}