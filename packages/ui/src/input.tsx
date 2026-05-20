import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition",
          "placeholder:text-[var(--text-muted)]",
          error
            ? "border-[var(--brand-danger)] focus:ring-2 focus:ring-[var(--brand-danger)]/30"
            : "border-[var(--border-soft)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
        )}
        style={{ background: "var(--surface)", color: "var(--text-primary)" }}
        {...props}
      />
      {error && (
        <p className="text-xs" style={{ color: "var(--brand-danger)" }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
