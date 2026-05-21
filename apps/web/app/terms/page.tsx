import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | GetPostFlow",
  description: "GetPostFlow terms of service.",
};

export default function TermsPage() {
  return (
    <main className="site-shell">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="content-card p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Terms of Service</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Last updated: May 2026 &mdash; Placeholder document pending legal review.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-7 text-[var(--text-secondary)]">
            <p>
              By accessing or using GetPostFlow (&ldquo;the Service&rdquo;), you agree to be
              bound by these Terms of Service.
            </p>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                Use of the Service
              </h2>
              <p>
                You may use the Service only for lawful purposes and in accordance with these
                Terms. You agree not to use the Service to violate any applicable laws or
                third-party platform terms.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                Accounts and Authentication
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your account
                credentials and for all activity that occurs under your account. You must
                notify us immediately of any unauthorized use.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                Intellectual Property
              </h2>
              <p>
                The Service and its original content, features, and functionality are and will
                remain the exclusive property of GetPostFlow. Content you create and publish
                through the Service remains your property subject to the licenses necessary
                to operate the platform.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                Subscriptions and Billing
              </h2>
              <p>
                Certain features are available on a paid subscription basis. Subscription fees
                are billed in advance on a monthly or annual basis. Cancellation policies and
                refund terms will be described in your subscription agreement.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, GetPostFlow shall not be
                liable for any indirect, incidental, special, consequential, or punitive
                damages arising out of or related to your use of the Service.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of
                the applicable jurisdiction, without regard to conflict of law provisions.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
                Contact
              </h2>
              <p>
                For questions regarding these Terms, contact{" "}
                <a
                  href="mailto:legal@getpostflow.com"
                  className="underline text-[var(--brand-primary)]"
                >
                  legal@getpostflow.com
                </a>
                .
              </p>
            </div>

            <p className="rounded-2xl border border-[var(--border-soft)] bg-[var(--subtle)] px-4 py-3 text-xs text-[var(--text-muted)]">
              This is a placeholder document prepared for platform app submissions. Complete,
              legally reviewed Terms of Service will be published before public launch.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
