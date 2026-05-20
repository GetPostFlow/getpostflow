"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { clsx } from "clsx";

type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

type AvatarProps = {
  src?: string | null;
  fallback: string;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({ src, fallback, size = "md", className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={clsx(
        "inline-flex select-none items-center justify-center overflow-hidden rounded-full align-middle",
        SIZE_CLASS[size],
        className
      )}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={fallback}
          className="h-full w-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center font-semibold uppercase"
        style={{ background: "var(--brand-primary)", color: "white" }}
      >
        {fallback.slice(0, 2)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
