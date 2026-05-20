import { plans } from "@getpostflow/billing";
import { launchPlatforms } from "@getpostflow/social";
import { Button } from "@getpostflow/ui/button";

const highlights = [
  "Unified publishing and approvals",
  "AI-assisted community engagement",
  "Multilingual brand voice support",
  "Client portal with direct publishing",
  "Branded exports and scheduled reports"
];

export default function MarketingHomePage() {
  return (
    <main className="site-shell">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10">
        <header className="content-card flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
              GetPostFlow
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Brand-safe AI social operations for managed-service teams and clients
            </p>
          </div>
          <nav className="hidden gap-6 text-sm text-[var(--text-secondary)] md:flex">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="/dashboard">Dashboard</a>
          </nav>
        </header>

        <div className="grid flex-1 gap-8 py-12 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-secondary)]">
              AI-powered SaaS for social community management
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
              Keep every post, reply, approval, and client handoff inside one system.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              GetPostFlow combines multilingual content generation, approval workflows,
              unified community management, analytics, and direct client publishing across
              all launch platforms.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="#pricing">Explore pricing</Button>
              <Button href="/dashboard" tone="secondary">
                Open dashboard shell
              </Button>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="content-card rounded-2xl px-4 py-4 text-sm text-[var(--text-secondary)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <aside className="content-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
              Launch coverage
            </p>
            <h2 className="mt-3 text-2xl font-semibold">All 9 supported platforms in scope</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {launchPlatforms.map((platform) => (
                <span
                  key={platform}
                  className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-1 text-sm text-[var(--text-secondary)]"
                >
                  {platform}
                </span>
              ))}
            </div>
            <div className="mt-8 rounded-3xl bg-[var(--brand-primary)] p-5 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                Reddit safety rule
              </p>
              <p className="mt-3 text-base leading-7 text-white/85">
                All Reddit interactions require human approval. GetPostFlow never auto-responds
                on Reddit to protect brands from community backlash.
              </p>
            </div>
          </aside>
        </div>

        <section id="features" className="grid gap-6 py-6 lg:grid-cols-3">
          <div className="content-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
              Content operations
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Create once, publish everywhere</h3>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              Generate platform-specific copy, track approvals, schedule content, and preserve
              normalized publishing records for both internal and client-driven actions.
            </p>
          </div>
          <div className="content-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
              Community workflows
            </p>
            <h3 className="mt-3 text-2xl font-semibold">AI-assisted, policy-controlled replies</h3>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              Route FAQs, compliments, and lead signals through configurable safety policies while
              escalating complaints, disputes, and regulated topics to human reviewers.
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--brand-danger)]">
              All Reddit interactions require human approval.
            </p>
          </div>
          <div className="content-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
              Client portal
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Approvals, analytics, and self-publish</h3>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              Clients can approve, reject, revise, or publish directly while the team receives
              notifications and a complete audit history stays attached to every item.
            </p>
          </div>
        </section>

        <section id="pricing" className="py-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
              Pricing and packaging
            </p>
            <h2 className="mt-3 text-4xl font-semibold">Competitive pricing with built-in approvals and AI ops</h2>
          </div>
          <div className="grid gap-6 xl:grid-cols-4">
            {plans.map((plan) => (
              <article key={plan.id} className="content-card flex h-full flex-col p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      {plan.monthlyPrice}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {plan.annualPrice}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
                    {plan.connectedSocialAccounts} accounts
                  </span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-[var(--text-secondary)]">
                  <li>Up to {plan.connectedSocialAccounts} connected social accounts</li>
                  <li>{plan.clientSeats} client seats</li>
                  <li>{plan.locales} locales included</li>
                  <li>{plan.aiTextCredits} AI text credits</li>
                  <li>{plan.aiImageCredits} AI image credits</li>
                  <li>{plan.aiVideoCredits} AI video credits</li>
                  <li>{plan.aiEngagementCredits} AI engagement credits</li>
                </ul>
                <div className="mt-6 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-xs leading-6 text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Pricing note:</strong> billed
                  monthly or billed annually at a discounted effective monthly rate. Annual total
                  is shown explicitly on every plan.
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
