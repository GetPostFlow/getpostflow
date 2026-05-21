import Link from "next/link";
import { LocaleSwitcher } from "./locale-switcher";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/sign-in", label: "Sign in" },
];

export function MarketingNav() {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b"
      style={{ background: "#F6F2EA", borderColor: "#D8CCBA" }}
    >
      <Link
        href="/"
        className="text-xl font-bold tracking-tight"
        style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#2F5D62" }}
      >
        GetPostFlow
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "#1A1A1A" }}>
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href} className="hover:opacity-70 transition">
            {l.label}
          </Link>
        ))}
        <Link
          href="/sign-up"
          className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "#2F5D62" }}
        >
          Start free trial
        </Link>
      </nav>
      <Link
        href="/sign-up"
        className="md:hidden rounded-xl px-4 py-2 text-sm font-semibold text-white"
        style={{ background: "#2F5D62" }}
      >
        Get started
      </Link>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer
      className="border-t px-6 py-10"
      style={{ borderColor: "#D8CCBA", background: "#F6F2EA" }}
    >
      <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <p
            className="text-base font-bold"
            style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#2F5D62" }}
          >
            GetPostFlow
          </p>
          <p className="text-xs mt-1 leading-5" style={{ color: "#5E6472" }}>
            Done-for-you social media management<br />for growing businesses.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8C6A43" }}>Product</p>
          {[["Features", "/features"], ["How it works", "/how-it-works"], ["Pricing", "/pricing"], ["Case Studies", "/case-studies"]].map(([l, h]) => (
            <Link key={h} href={h} className="block text-xs mb-2 hover:text-[#1A1A1A] transition" style={{ color: "#5E6472" }}>{l}</Link>
          ))}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8C6A43" }}>Company</p>
          {[["About", "/about"], ["Blog", "/blog"], ["Careers", "/careers"], ["Contact", "/contact"], ["FAQ", "/faq"]].map(([l, h]) => (
            <Link key={h} href={h} className="block text-xs mb-2 hover:text-[#1A1A1A] transition" style={{ color: "#5E6472" }}>{l}</Link>
          ))}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8C6A43" }}>Legal</p>
          {[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Cookie Policy", "/legal/cookie-policy"], ["GDPR", "/legal/gdpr"]].map(([l, h]) => (
            <Link key={h} href={h} className="block text-xs mb-2 hover:text-[#1A1A1A] transition" style={{ color: "#5E6472" }}>{l}</Link>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-6xl mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4"
        style={{ borderColor: "#D8CCBA" }}>
        <p className="text-xs" style={{ color: "#5E6472" }}>© 2025 GetPostFlow. All rights reserved.</p>
        <LocaleSwitcher />
        <p className="text-xs" style={{ color: "#5E6472" }}>
          <Link href="mailto:hello@getpostflow.com" className="hover:text-[#1A1A1A] transition">hello@getpostflow.com</Link>
        </p>
      </div>
    </footer>
  );
}
