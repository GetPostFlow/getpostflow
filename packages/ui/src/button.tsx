import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode
} from "react";
import { clsx } from "clsx";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/** @deprecated Use `variant` instead */
type Tone = "primary" | "secondary";

type SharedProps = {
  children: ReactNode;
  /** @deprecated use `variant` */
  tone?: Tone;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type LinkButtonProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ActionButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand-primary)] text-white hover:opacity-90",
  secondary:
    "bg-[var(--subtle)] text-[var(--brand-primary)] hover:bg-[var(--border-soft)]",
  outline:
    "border border-[var(--border-soft)] text-[var(--text-primary)] hover:bg-[var(--subtle)]",
  ghost:
    "text-[var(--text-secondary)] hover:bg-[var(--subtle)]",
  danger:
    "bg-[var(--brand-danger)] text-white hover:opacity-90",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

function resolveVariant(tone?: Tone, variant?: ButtonVariant): ButtonVariant {
  if (variant) return variant;
  if (tone === "secondary") return "secondary";
  return "primary";
}

export function Button(props: LinkButtonProps | ActionButtonProps) {
  const { tone, variant, size = "md", className: extraClass } = props;
  const resolvedVariant = resolveVariant(tone, variant);

  const classes = clsx(
    "inline-flex items-center justify-center font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed",
    VARIANT_STYLES[resolvedVariant],
    SIZE_STYLES[size],
    extraClass
  );

  if ("href" in props && props.href) {
    const { children, href, tone: _t, variant: _v, size: _s, className: _c, ...rest } = props;
    return (
      <a className={classes} href={href} {...rest}>
        {children}
      </a>
    );
  }

  const { children, tone: _t, variant: _v, size: _s, className: _c, type, ...rest } =
    props as ActionButtonProps;

  return (
    <button className={classes} type={type ?? "button"} {...rest}>
      {children}
    </button>
  );
}
