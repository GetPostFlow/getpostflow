import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | GetPostFlow",
  description: "GetPostFlow privacy policy.",
};

export default function PrivacyPage() {
  return (
    <main className="site-shell">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="content-card p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Last updated: May 2026 &mdash; Placeholder document pending legal review.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-7 text-[var(--text-secondary)]">
            <p>
              This Privacy Policy describes how GetPostFlow (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
              &ldquo;our&rdquo;) collects, uses, and shares information about you when you use
              our platform.
            </p>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                Information We Collect
              </h2>
              <p>
                We collect information you provide directly to us, information we receive from
                third-party services you connect (such as social media accounts), and information
                collected automatically as you use the platform.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                How We Use Your Information
              </h2>
              <p>
                We use the information we collect to provide, maintain, and improve the platform,
                process transactions, send transactional and promotional communications, and
                comply with legal obligations.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                Data Sharing
              </h2>
              <p>
                We do not sell your personal data. We share information only with service
                providers who process data on our behalf, when required by law, or with your
                explicit consent.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                GDPR & Your Rights
              </h2>
              <p>
                If you are located in the European Economic Area, you have rights under the
                General Data Protection Regulation (GDPR), including the right to access,
                rectify, or erase your personal data. To exercise these rights, contact us at{" "}
                <a
                  href="mailto:privacy@getpostflow.com"
                  className="underline text-[var(--brand-primary)]"
                >
                  privacy@getpostflow.com
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                Contact
              </h2>
              <p>
                For privacy inquiries, contact{" "}
                <a
                  href="mailto:privacy@getpostflow.com"
                  className="underline text-[var(--brand-primary)]"
                >
                  privacy@getpostflow.com
                </a>
                .
              </p>
            </div>

            <p className="rounded-2xl border border-[var(--border-soft)] bg-[var(--subtle)] px-4 py-3 text-xs text-[var(--text-muted)]">
              This is a placeholder document prepared for platform app submissions. A complete,
              legally reviewed privacy policy will be published before public launch.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
