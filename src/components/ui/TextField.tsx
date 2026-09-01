import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function TextField({ label, error, id, ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--ink)]">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`rounded-lg border px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--brand)] ${
          error ? "border-[var(--urgent)]" : "border-[var(--line)]"
        }`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-[var(--urgent-deep)]">
          {error}
        </p>
      )}
    </div>
  );
}