import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function TextField({
  label,
  error,
  id,
  ...props
}: TextFieldProps) {
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
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-lg border bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] ${
          error
            ? "border-[var(--urgent)]"
            : "border-[var(--line)] hover:border-slate-300"
        }`}
        {...props}
      />

      {error && (
        <p
          id={`${id}-error`}
          className="text-xs font-medium text-[var(--urgent-deep)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}