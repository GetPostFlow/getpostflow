import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "flat";
};

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl",
        variant === "default"
          ? "border shadow-sm"
          : "border",
        className
      )}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border-soft)",
        boxShadow: variant === "default" ? "0 4px 16px rgba(31,36,48,0.06)" : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("px-6 py-4 border-b", className)} style={{ borderColor: "var(--border-soft)" }} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("px-6 py-4 border-t", className)}
      style={{ borderColor: "var(--border-soft)" }}
      {...props}
    >
      {children}
    </div>
  );
}
