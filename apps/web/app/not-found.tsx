import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#F6F2EA", color: "#1A1A1A" }}
    >
      <Link
        href="/"
        className="text-xl font-bold mb-12"
        style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#2F5D62" }}
      >
        GetPostFlow
      </Link>
      <p
        className="text-8xl font-bold mb-4"
        style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#D8CCBA" }}
      >
        404
      </p>
      <h1
        className="text-2xl font-bold mb-3"
        style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
      >
        Page not found
      </h1>
      <p className="text-base mb-10 max-w-sm" style={{ color: "#5E6472" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="inline-flex rounded-xl px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "#2F5D62" }}
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          className="inline-flex rounded-xl border px-7 py-3 text-sm font-semibold transition hover:bg-[#EFE7DA]"
          style={{ borderColor: "#2F5D62", color: "#2F5D62" }}
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}
