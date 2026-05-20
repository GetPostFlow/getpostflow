import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode
} from "react";

type Tone = "primary" | "secondary";

type SharedProps = {
  children: ReactNode;
  tone?: Tone;
};

type LinkButtonProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ActionButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

function getStyles(tone: Tone) {
  if (tone === "secondary") {
    return "border border-[var(--border-soft)] bg-white text-[var(--text-primary)] hover:bg-[var(--subtle)]";
  }

  return "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]";
}

export function Button(props: LinkButtonProps | ActionButtonProps) {
  const tone = props.tone ?? "primary";
  const className =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition " +
    getStyles(tone);

  if ("href" in props && props.href) {
    const { children, href, tone: _tone, ...rest } = props;

    return (
      <a className={className} href={href} {...rest}>
        {children}
      </a>
    );
  }

  const { children, tone: _tone, type, ...rest } = props as ActionButtonProps;

  return (
    <button className={className} type={type ?? "button"} {...rest}>
      {children}
    </button>
  );
}
