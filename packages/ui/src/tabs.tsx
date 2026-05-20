"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { clsx } from "clsx";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={clsx(
        "inline-flex items-center rounded-xl p-1 gap-0.5",
        className
      )}
      style={{ background: "var(--subtle)" }}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-4 py-1.5 text-sm font-medium transition",
        "data-[state=active]:shadow-sm",
        "data-[state=inactive]:text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        className
      )}
      style={
        {
          "--active-bg": "var(--surface)",
          "--active-color": "var(--brand-primary)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: TabsPrimitive.TabsContentProps) {
  return (
    <TabsPrimitive.Content className={clsx("mt-4", className)} {...props} />
  );
}

// React import needed for inline styles
import type React from "react";
