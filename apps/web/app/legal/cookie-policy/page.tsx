import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/lib/marketing/nav";

export const metadata: Metadata = {
  title: "Cookie Policy | GetPostFlow",
  description: "GetPostFlow cookie policy — what cookies we use, why, and how to control them.",
};

export default function CookiePolicyPage() {
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
            Cookie Policy
          </h1>
          <p className="text-xs mb-8" style={{ color: "#5E6472" }}>
            Last updated: May 2026 — Placeholder document pending legal review.
          </p>

          <div className="flex flex-col gap-6 text-sm leading-7" style={{ color: "#3A3A3A" }}>
            <p>
              GetPostFlow uses cookies and similar tracking technologies to operate our platform,
              improve your experience, and understand how our service is used.
            </p>

            <div>
              <h2 className="text-base font-bold mb-2" style={{ color: "#1A1A1A" }}>What are cookies?</h2>
              <p>
                Cookies are small text files placed on your device when you visit a website. They help
                us remember your preferences, keep you logged in, and measure platform performance.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold mb-2" style={{ color: "#1A1A1A" }}>Cookies we use</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#EFE7DA" }}>
                      {["Category", "Purpose", "Examples"].map((h) => (
                        <th key={h} className="text-left px-4 py-2 font-semibold" style={{ color: "#1A1A1A" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Essential", "Required for the platform to function. Cannot be disabled.", "__session, __clerk_db_jwt"],
                      ["Analytics", "Help us understand how users interact with the platform (anonymized).", "_posthog, _ga"],
                      ["Error tracking", "Capture errors to help us fix bugs faster.", "sentry-session"],
                      ["Preferences", "Remember your settings like language and billing interval.", "gpf-locale, gpf-prefs"],
                    ].map(([cat, purpose, examples]) => (
                      <tr key={cat} style={{ borderBottom: "1px solid #EFE7DA" }}>
                        <td className="px-4 py-2.5 font-semibold" style={{ color: "#1A1A1A" }}>{cat}</td>
                        <td className="px-4 py-2.5" style={{ color: "#3A3A3A" }}>{purpose}</td>
                        <td className="px-4 py-2.5 font-mono" style={{ color: "#5E6472", fontSize: "11px" }}>{examples}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold mb-2" style={{ color: "#1A1A1A" }}>How to control cookies</h2>
              <p>
                You can control or delete cookies through your browser settings. Note that disabling
                essential cookies will prevent you from logging in or using core platform features.
                Most browsers allow you to block third-party cookies without affecting essential
                functionality.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold mb-2" style={{ color: "#1A1A1A" }}>Contact</h2>
              <p>
                For cookie-related inquiries, contact{" "}
                <a href="mailto:privacy@getpostflow.com" className="underline" style={{ color: "#2F5D62" }}>
                  privacy@getpostflow.com
                </a>.
              </p>
            </div>

            <p
              className="rounded-2xl border px-4 py-3 text-xs"
              style={{ background: "#F6F2EA", borderColor: "#D8CCBA", color: "#5E6472" }}
            >
              This is a placeholder document. A complete, legally reviewed cookie policy will be
              published before public launch.
            </p>
          </div>
        </div>
      </article>

      <MarketingFooter />
    </div>
  );
}
