export default function ContentPage() {
  return (
    <main className="site-shell min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <section className="content-card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
            Content operations
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Content calendar, approvals, and client publishing</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
            This workspace will power campaign briefs, platform variants, approval workflows,
            client self-publish tracking, and normalized publishing records.
          </p>
        </section>
      </div>
    </main>
  );
}
