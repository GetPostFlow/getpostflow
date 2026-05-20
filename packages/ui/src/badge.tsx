import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "outline";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: "bg-[var(--subtle)] text-[var(--text-secondary)]",
  success: "bg-[var(--brand-success)]/15 text-[var(--brand-success)]",
  warning: "bg-[var(--brand-warning)]/15 text-[var(--brand-warning)]",
  danger: "bg-[var(--brand-danger)]/15 text-[var(--brand-danger)]",
  outline: "border border-[var(--border-soft)] text-[var(--text-secondary)]",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_STYLES[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
