import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table className={clsx("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={clsx("[&_tr]:border-b", className)} style={{ borderColor: "var(--border-soft)" }} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={clsx("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={clsx("border-b transition-colors hover:bg-[var(--subtle)]/50", className)}
      style={{ borderColor: "var(--border-soft)" }}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx("h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider", className)}
      style={{ color: "var(--text-muted)" }}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={clsx("px-4 py-3 align-middle", className)}
      style={{ color: "var(--text-primary)" }}
      {...props}
    />
  );
}
