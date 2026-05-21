import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal — GetPostFlow",
  description: "Review and approve your brand strategy, content, and reports.",
};

interface LayoutProps {
  children: React.ReactNode;
  params?: Promise<unknown>;
}

// Note: searchParams aren't available in layouts; we pass preview via client component
export default function PortalLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#f5f6fa",
          color: "#1a1a1a",
          minHeight: "100vh",
        }}
      >
        <header
          style={{
            borderBottom: "1px solid #e5e7eb",
            background: "#fff",
            padding: "0 24px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #2F5D62 0%, #52b788 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              G
            </div>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>GetPostFlow</span>
            <span
              style={{
                background: "#f0fdf4",
                color: "#16a34a",
                borderRadius: "999px",
                padding: "2px 8px",
                fontSize: "11px",
                fontWeight: 500,
                border: "1px solid #bbf7d0",
              }}
            >
              Client Portal
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af" }}>
            Powered by GetPostFlow
          </div>
        </header>
        <main style={{ padding: "32px 24px", maxWidth: "960px", margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
