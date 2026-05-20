import type { ReactNode } from "react";
import { clsx } from "clsx";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx("flex flex-col items-center justify-center py-16 text-center gap-4", className)}>
      {icon && (
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ background: "var(--subtle)", color: "var(--brand-primary)" }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        {description && (
          <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
