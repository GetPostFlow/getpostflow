"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { clsx } from "clsx";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={clsx(
        "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)]",
        "data-[placeholder]:text-[var(--text-muted)]",
        className
      )}
      style={{ background: "var(--surface)", borderColor: "var(--border-soft)", color: "var(--text-primary)" }}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="ml-2 opacity-60">▾</SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, ...props }: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={clsx(
          "z-50 min-w-[8rem] overflow-hidden rounded-xl border p-1 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        style={{ background: "var(--surface)", borderColor: "var(--border-soft)" }}
        position="popper"
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={clsx(
        "relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none",
        "focus:bg-[var(--subtle)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      style={{ color: "var(--text-primary)" }}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectLabel({ className, ...props }: SelectPrimitive.SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      className={clsx("px-3 py-1.5 text-xs font-semibold uppercase tracking-wider", className)}
      style={{ color: "var(--text-muted)" }}
      {...props}
    />
  );
}

export const SelectGroup = SelectPrimitive.Group;
export const SelectSeparator = SelectPrimitive.Separator;
