import { autoEngagementDefaults } from "@getpostflow/social";

export default function InboxPage() {
  return (
    <main className="site-shell min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="content-card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
            Community inbox
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Policy-controlled AI engagement foundation</h1>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {autoEngagementDefaults.map((policy) => (
              <div key={policy.category} className="rounded-3xl border border-[var(--border-soft)] bg-white p-5">
                <h2 className="text-lg font-semibold">{policy.category}</h2>
                <p className="mt-2 text-sm text-[var(--brand-primary)]">{policy.defaultHandling}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{policy.notes}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
