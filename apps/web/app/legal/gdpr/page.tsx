import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";

export const metadata: Metadata = {
  title: "GDPR Compliance | GetPostFlow",
  description: "Your rights under the General Data Protection Regulation (GDPR) and how to exercise them with GetPostFlow.",
};

export default function GDPRPage() {
  return (
    <div style={{ background: "#F6F2EA", color: "#1A1A1A" }}>
      <MarketingNav />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border p-10" style={{ background: "#FFFDF9", borderColor: "#D8CCBA" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8C6A43" }}>
            Legal
          </p>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
          >
            GDPR Compliance
          </h1>
          <p className="text-xs mb-8" style={{ color: "#5E6472" }}>
            Last updated: May 2026 — Placeholder document pending legal review.
          </p>

          <div className="flex flex-col gap-6 text-sm leading-7" style={{ color: "#3A3A3A" }}>
            <p>
              GetPostFlow is committed to protecting the personal data of users in the European
              Economic Area (EEA) in accordance with the General Data Protection Regulation (GDPR).
            </p>

            <div>
              <h2 className="text-base font-bold mb-2" style={{ color: "#1A1A1A" }}>Data controller</h2>
              <p>
                GetPostFlow acts as the data controller for personal data collected through the platform.
                Our Data Protection contact: <a href="mailto:privacy@getpostflow.com" className="underline" style={{ color: "#2F5D62" }}>privacy@getpostflow.com</a>.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold mb-2" style={{ color: "#1A1A1A" }}>Your rights under GDPR</h2>
              <ul className="flex flex-col gap-3">
                {[
                  { right: "Right to access", desc: "Request a copy of the personal data we hold about you." },
                  { right: "Right to rectification", desc: "Request correction of inaccurate or incomplete personal data." },
                  { right: "Right to erasure ('right to be forgotten')", desc: "Request deletion of your personal data, subject to legal obligations." },
                  { right: "Right to restriction", desc: "Request that we limit how we process your data in certain circumstances." },
                  { right: "Right to data portability", desc: "Receive your personal data in a structured, machine-readable format." },
                  { right: "Right to object", desc: "Object to processing of your personal data for direct marketing or legitimate interests." },
                  { right: "Right to withdraw consent", desc: "Withdraw consent at any time where processing is based on consent." },
                ].map((item) => (
                  <li key={item.right} className="flex flex-col gap-0.5">
                    <span className="font-semibold text-xs" style={{ color: "#1A1A1A" }}>{item.right}</span>
                    <span className="text-xs" style={{ color: "#5E6472" }}>{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-base font-bold mb-2" style={{ color: "#1A1A1A" }}>Legal bases for processing</h2>
              <p>
                We process personal data on the following legal bases: contract performance (to provide
                the service), legitimate interests (platform security, analytics), legal obligations,
                and consent (marketing communications).
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold mb-2" style={{ color: "#1A1A1A" }}>International data transfers</h2>
              <p>
                Some of our service providers are located outside the EEA. Where data is transferred
                internationally, we ensure appropriate safeguards are in place (e.g., Standard
                Contractual Clauses).
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold mb-2" style={{ color: "#1A1A1A" }}>How to exercise your rights</h2>
              <p>
                Submit a request to <a href="mailto:privacy@getpostflow.com" className="underline" style={{ color: "#2F5D62" }}>privacy@getpostflow.com</a>.
                We will respond within 30 days. You also have the right to lodge a complaint with your
                local data protection authority.
              </p>
            </div>

            <p
              className="rounded-2xl border px-4 py-3 text-xs"
              style={{ background: "#F6F2EA", borderColor: "#D8CCBA", color: "#5E6472" }}
            >
              This is a placeholder document. A complete, legally reviewed GDPR compliance notice
              will be published before public launch.
            </p>
          </div>
        </div>
      </article>

      <MarketingFooter />
    </div>
  );
}
