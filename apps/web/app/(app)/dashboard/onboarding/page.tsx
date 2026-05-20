export default function OnboardingPage() {
  return (
    <main className="site-shell min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <section className="content-card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
            Onboarding workflow
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Client intake and strategist review foundation</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
            This route will host the onboarding form, asset intake, website analysis summary,
            brand profile generation, strategy drafts, and mandatory internal review before
            client approval.
          </p>
        </section>
      </div>
    </main>
  );
}
