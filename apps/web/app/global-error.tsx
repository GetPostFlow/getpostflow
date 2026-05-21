"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          background: "#F6F2EA",
          color: "#1A1A1A",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "80px",
            fontWeight: 700,
            color: "#D8CCBA",
            margin: "0 0 16px",
            lineHeight: 1,
          }}
        >
          500
        </p>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#1A1A1A",
            margin: "0 0 12px",
          }}
        >
          Something went wrong
        </h1>
        <p style={{ fontSize: "14px", color: "#5E6472", maxWidth: "380px", margin: "0 0 40px" }}>
          We hit an unexpected error. Our team has been notified automatically.
          {error.digest && (
            <span style={{ display: "block", marginTop: "8px", fontSize: "11px", color: "#8b9099" }}>
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            style={{
              background: "#2F5D62",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              background: "transparent",
              color: "#2F5D62",
              border: "1.5px solid #2F5D62",
              borderRadius: "12px",
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}
