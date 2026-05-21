"use client";

import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        className="text-7xl font-bold mb-4"
        style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#D8CCBA" }}
      >
        500
      </p>
      <h1
        className="text-2xl font-bold mb-3"
        style={{ fontFamily: "var(--font-heading,'Poppins'),sans-serif", color: "#1A1A1A" }}
      >
        Something went wrong
      </h1>
      <p className="text-sm mb-2 max-w-sm" style={{ color: "#5E6472" }}>
        We hit an unexpected error. Our team has been notified.
      </p>
      {error.digest && (
        <p className="text-xs mb-8" style={{ color: "#8b9099" }}>
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
        <button
          onClick={() => reset()}
          className="inline-flex rounded-xl px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "#2F5D62" }}
        >
          Try again
        </button>
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
