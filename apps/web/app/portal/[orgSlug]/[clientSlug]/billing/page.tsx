import { createDb, invoices, orgSubscriptions, plans, clients, orgs } from "@getpostflow/db";
import { eq, desc } from "drizzle-orm";
import { validatePortalToken, InvalidToken, PortalNav } from "../../../_portal-helpers";

interface Props {
  params: Promise<{ orgSlug: string; clientSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function PortalBillingPage({ params, searchParams }: Props) {
  const { orgSlug, clientSlug } = await params;
  const { token } = await searchParams;

  if (!token) return <InvalidToken reason="No token provided." />;

  const validated = await validatePortalToken(token, orgSlug, clientSlug);
  if (!validated) return <InvalidToken reason="This link has expired or is invalid." />;

  const { client, org } = validated;
  const db = createDb(process.env.DATABASE_URL!);

  const invoiceRows = await db
    .select()
    .from(invoices)
    .where(eq(invoices.clientId, client.id))
    .orderBy(desc(invoices.invoiceDate))
    .limit(20);

  const [sub] = await db
    .select()
    .from(orgSubscriptions)
    .where(eq(orgSubscriptions.orgId, org.id))
    .limit(1);

  let planName = "Starter";
  let planPrice = "$499/mo";
  if (sub) {
    const [plan] = await db.select().from(plans).where(eq(plans.code, sub.planCode)).limit(1);
    if (plan) {
      planName = plan.name;
      planPrice = `$${(plan.monthlyPriceCents / 100).toFixed(0)}/mo`;
    }
  }

  const nextBilling = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  return (
    <div>
      <PortalNav orgSlug={orgSlug} clientSlug={clientSlug} token={token} active="billing" />

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>Billing</h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Subscription and invoice history for <strong>{client.name}</strong>.
        </p>
      </div>

      {/* Plan card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: "6px" }}>
              Current Plan
            </p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a" }}>{planName}</p>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "2px" }}>{planPrice}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: "6px" }}>
              Next Billing Date
            </p>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a" }}>{nextBilling}</p>
          </div>
        </div>
        <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a
            href={`mailto:billing@getpostflow.com?subject=Update payment method - ${client.name}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#2F5D62",
              color: "#fff",
              borderRadius: "12px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Update Payment Method
          </a>
          <a
            href={`mailto:billing@getpostflow.com?subject=Cancel subscription - ${client.name}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "transparent",
              color: "#6b7280",
              borderRadius: "12px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              border: "1px solid #e5e7eb",
            }}
          >
            Request Cancellation
          </a>
        </div>
      </div>

      {/* Refund & cancellation policy — blueprint §4.2 */}
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "18px 20px",
          marginBottom: "20px",
        }}
      >
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
          💳 Billing &amp; Cancellation Policy
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "#374151" }}>14-Day Money-Back Guarantee:</strong>{" "}
            If you are not satisfied within the first 14 days of your subscription, email{" "}
            <a href="mailto:billing@getpostflow.com" style={{ color: "#2F5D62" }}>billing@getpostflow.com</a>{" "}
            for a full refund — no questions asked.
          </p>
          <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "#374151" }}>Cancellation:</strong>{" "}
            Cancel anytime by emailing{" "}
            <a href="mailto:billing@getpostflow.com" style={{ color: "#2F5D62" }}>billing@getpostflow.com</a>
            {" "}with subject &quot;Cancel subscription — {client.name}&quot;.
            Your service continues until the end of the current billing period.
          </p>
          <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "#374151" }}>Billing questions?</strong>{" "}
            Reach us at{" "}
            <a href="mailto:billing@getpostflow.com" style={{ color: "#2F5D62" }}>billing@getpostflow.com</a>
            {" "}or visit our{" "}
            <a href="https://getpostflow.com/terms" style={{ color: "#2F5D62" }}>Terms of Service</a>.
          </p>
        </div>
      </div>

      {/* Invoices */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>Invoice History</p>
        </div>
        {invoiceRows.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
            No invoices yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {invoiceRows.map((inv, idx) => (
              <div
                key={inv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  borderBottom: idx < invoiceRows.length - 1 ? "1px solid #f3f4f6" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: inv.status === "paid" ? "#d1fae5" : "#fef3c7",
                      color: inv.status === "paid" ? "#065f46" : "#92400e",
                      flexShrink: 0,
                    }}
                  >
                    {inv.status === "paid" ? "Paid" : "Open"}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a1a", marginBottom: "2px" }}>
                      {inv.description ?? "Invoice"}
                    </p>
                    <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                      {new Date(inv.invoiceDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
                    ${(inv.amountCents / 100).toFixed(2)}
                  </span>
                  {inv.pdfUrl && (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#2F5D62",
                        textDecoration: "none",
                      }}
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
