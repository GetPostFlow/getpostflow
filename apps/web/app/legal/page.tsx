import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";

export const metadata: Metadata = {
  title: "Legal | GetPostFlow",
  description: "Legal documents for GetPostFlow: Privacy Policy, Terms of Service, Cookie Policy, and GDPR compliance information.",
};

export default function LegalIndexPage() {
  const docs = [
    { title: "Privacy Policy", href: "/privacy", description: "How we collect, use, and protect your personal data." },
    { title: "Terms of Service", href: "/terms", description: "The terms governing your use of GetPostFlow." },
    { title: "Cookie Policy", href: "/legal/cookie-policy", description: "What cookies we use and how to manage them." },
    { title: "GDPR Compliance", href: "/legal/gdpr", description: "Your rights under GDPR and how to exercise them." },
  ];

  return (
    <div style={{ background: "#F6F2EA", color: "#1A1A1A" }}>
      <MarketingNav />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8C6A43" }}>
          Legal
        </p>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
        >
          Legal documents
        </h1>
        <p className="text-base leading-8 mb-10" style={{ color: "#3A3A3A" }}>
          All legal documents are placeholder versions pending formal legal review before public launch.
        </p>

        <div className="flex flex-col gap-4">
          {docs.map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              className="group rounded-2xl border p-6 flex items-center justify-between transition hover:shadow-md"
              style={{ background: "#FFFDF9", borderColor: "#D8CCBA" }}
            >
              <div>
                <p className="font-bold text-sm" style={{ color: "#1A1A1A" }}>{doc.title}</p>
                <p className="text-xs mt-1" style={{ color: "#5E6472" }}>{doc.description}</p>
              </div>
              <svg className="shrink-0 ml-4" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="#2F5D62" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
