"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { clsx } from "clsx";

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = ({ className, ...props }: ToastPrimitive.ToastViewportProps) => (
  <ToastPrimitive.Viewport
    className={clsx(
      "fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2",
      className
    )}
    {...props}
  />
);

type ToastVariant = "default" | "success" | "error";

const TOAST_STYLES: Record<ToastVariant, string> = {
  default: "border-[var(--border-soft)]",
  success: "border-[var(--brand-success)]",
  error: "border-[var(--brand-danger)]",
};

export function Toast({
  variant = "default",
  className,
  ...props
}: ToastPrimitive.ToastProps & { variant?: ToastVariant }) {
  return (
    <ToastPrimitive.Root
      className={clsx(
        "rounded-xl border p-4 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full",
        TOAST_STYLES[variant],
        className
      )}
      style={{ background: "var(--surface)" }}
      {...props}
    />
  );
}

export function ToastTitle({ className, ...props }: ToastPrimitive.ToastTitleProps) {
  return (
    <ToastPrimitive.Title
      className={clsx("text-sm font-semibold", className)}
      style={{ color: "var(--text-primary)" }}
      {...props}
    />
  );
}

export function ToastDescription({ className, ...props }: ToastPrimitive.ToastDescriptionProps) {
  return (
    <ToastPrimitive.Description
      className={clsx("text-xs mt-1", className)}
      style={{ color: "var(--text-secondary)" }}
      {...props}
    />
  );
}

export const ToastClose = ToastPrimitive.Close;
export const ToastAction = ToastPrimitive.Action;
