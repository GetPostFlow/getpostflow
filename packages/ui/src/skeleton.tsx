import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("animate-pulse rounded-lg", className)}
      style={{ background: "var(--subtle)" }}
      {...props}
    />
  );
}
