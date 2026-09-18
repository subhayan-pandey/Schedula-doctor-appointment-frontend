import type { ButtonHTMLAttributes } from "react";

type Variant =
  | "primary"
  | "outline"
  | "ghost";

type Size =
  | "sm"
  | "md"
  | "lg";

type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
  };

const variantStyles: Record<
  Variant,
  string
> = {
  primary:
    "bg-[var(--brand)] text-white hover:bg-[var(--brand-deep)]",
  outline:
    "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]",
  ghost:
    "text-[var(--brand)] hover:bg-[var(--brand-soft)]",
};

const sizeStyles: Record<
  Size,
  string
> = {
  sm:
    "min-h-9 px-3 text-sm",
  md:
    "min-h-10 px-4 text-sm",
  lg:
    "min-h-11 px-6 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-semibold leading-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-soft)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
}