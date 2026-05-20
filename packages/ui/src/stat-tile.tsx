import type { ReactNode } from "react";
import { Card, CardContent } from "./card";
import { clsx } from "clsx";

type StatTileProps = {
  label: string;
  value: string | number;
  change?: string;
  changePositive?: boolean;
  icon?: ReactNode;
  className?: string;
};

export function StatTile({ label, value, change, changePositive, icon, className }: StatTileProps) {
  return (
    <Card className={clsx("flex flex-col gap-3", className)}>
      <CardContent className="py-5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {label}
          </span>
          {icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--subtle)", color: "var(--brand-primary)" }}>
              {icon}
            </span>
          )}
        </div>
        <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        {change && (
          <p
            className="mt-1 text-xs font-medium"
            style={{ color: changePositive ? "var(--brand-success)" : "var(--brand-danger)" }}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
