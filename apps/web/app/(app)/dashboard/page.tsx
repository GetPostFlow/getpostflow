import { roleGroups } from "@getpostflow/permissions";

export default function DashboardPage() {
  return (
    <main className="site-shell min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <section className="content-card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
            Internal dashboard shell
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Foundation workspace is ready for feature implementation</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
            This dashboard route is the initial app shell for internal team workflows, client
            operations, permissions, billing, onboarding, content approvals, and community
            management modules.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
            <a className="rounded-full border border-[var(--border-soft)] bg-white px-4 py-2" href="/dashboard/onboarding">
              Onboarding
            </a>
            <a className="rounded-full border border-[var(--border-soft)] bg-white px-4 py-2" href="/dashboard/content">
              Content
            </a>
            <a className="rounded-full border border-[var(--border-soft)] bg-white px-4 py-2" href="/dashboard/inbox">
              Inbox
            </a>
            <a className="rounded-full border border-[var(--border-soft)] bg-white px-4 py-2" href="/dashboard/analytics">
              Analytics
            </a>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {roleGroups.map((group) => (
              <div key={group.label} className="rounded-3xl border border-[var(--border-soft)] bg-white p-5">
                <h2 className="text-lg font-semibold">{group.label}</h2>
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                  {group.roles.map((role) => (
                    <li key={role}>{role}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
