import { metricNames } from "@getpostflow/analytics";
import { reportFormats } from "@getpostflow/reporting";

export default function AnalyticsPage() {
  return (
    <main className="site-shell min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="content-card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
            Analytics and reporting
          </p>
          <h1 className="mt-3 text-4xl font-semibold">
            Metrics, exports, and scheduled reporting foundation
          </h1>
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-[var(--border-soft)] bg-white p-5">
              <h2 className="text-lg font-semibold">Core metrics</h2>
              <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                {metricNames.map((metric) => (
                  <li key={metric}>{metric}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[var(--border-soft)] bg-white p-5">
              <h2 className="text-lg font-semibold">Export formats</h2>
              <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                {reportFormats.map((format) => (
                  <li key={format}>{format}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}