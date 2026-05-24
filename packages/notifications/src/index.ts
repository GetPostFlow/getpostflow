/**
 * GetPostFlow Email Notification System
 *
 * Centralised email dispatch via Resend with typed templates for every
 * workflow transition defined in the blueprint.
 */

export type EmailTemplate =
  | "welcome"
  | "intake_reminder"
  | "strategy_ready_for_internal_review"
  | "strategy_sent_to_client"
  | "strategy_approved_by_client"
  | "content_awaiting_approval"
  | "content_approved"
  | "content_published"
  | "funnel_conversion";

interface SendOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

async function sendEmail(opts: SendOptions): Promise<{ success: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "hello@getpostflow.com";

  if (!resendKey || resendKey.length <= 10) {
    console.log(`[notifications] Stub email to ${opts.to}:\nSubject: ${opts.subject}`);
    return { success: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: opts.from ?? `GetPostFlow <${fromEmail}>`,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[notifications] Resend error:", res.status, text);
      return { success: false, error: text };
    }

    return { success: true };
  } catch (err) {
    console.error("[notifications] Send failed:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ─── Template builders ────────────────────────────────────────────────────────

function baseEmail({ title, body, cta }: { title: string; body: string; cta?: { text: string; url: string } }): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Inter,system-ui,sans-serif;background:#f8f9fa;color:#1a1a1a">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
    <div style="background:linear-gradient(135deg,#2F5D62 0%,#52b788 100%);padding:28px 32px">
      <p style="color:white;font-size:20px;font-weight:700;margin:0">GetPostFlow</p>
      <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0">Social Media Management</p>
    </div>
    <div style="padding:32px">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 12px">${title}</h1>
      <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 20px">${body}</p>
      ${cta ? `<a href="${cta.url}" style="display:inline-block;background:#2F5D62;color:white;text-decoration:none;border-radius:12px;padding:14px 28px;font-size:14px;font-weight:600;margin-bottom:20px">${cta.text} →</a>` : ""}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="font-size:11px;color:#9ca3af;margin:0">GetPostFlow · hello@getpostflow.com</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(opts: { to: string; clientName: string; magicLink: string }) {
  return sendEmail({
    to: opts.to,
    subject: "Welcome to GetPostFlow — Let's get started",
    html: baseEmail({
      title: `Welcome, ${opts.clientName}!`,
      body: "Thank you for joining GetPostFlow. Your payment has been confirmed and your dedicated client portal is ready. Please complete your intake form so our team can begin crafting your social media strategy.",
      cta: { text: "Complete Intake Form", url: opts.magicLink },
    }),
  });
}

export async function sendIntakeReminderEmail(opts: { to: string; clientName: string; magicLink: string }) {
  return sendEmail({
    to: opts.to,
    subject: "Reminder: Complete Your GetPostFlow Intake",
    html: baseEmail({
      title: "Don't Forget Your Intake Form",
      body: `Hi ${opts.clientName}, we noticed you haven't completed your intake form yet. This information is essential for us to build your custom strategy.`,
      cta: { text: "Complete Intake Form", url: opts.magicLink },
    }),
  });
}

export async function sendStrategyReadyForInternalReviewEmail(opts: {
  to: string | string[];
  clientName: string;
  reviewUrl: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Strategy Ready for Internal Review — ${opts.clientName}`,
    html: baseEmail({
      title: "Strategy Ready for Review",
      body: `The AI-generated strategy for <strong>${opts.clientName}</strong> is ready for internal review. Please review, refine, and approve before sending to the client.`,
      cta: { text: "Review Strategy", url: opts.reviewUrl },
    }),
  });
}

export async function sendStrategySentToClientEmail(opts: {
  to: string;
  clientName: string;
  magicLink: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Your Brand Strategy is Ready for Review — ${opts.clientName}`,
    html: baseEmail({
      title: "Your Brand Strategy is Ready",
      body: `We've completed the brand strategy draft for <strong>${opts.clientName}</strong>. Please review it and either approve or request changes.`,
      cta: { text: "Review Strategy", url: opts.magicLink },
    }),
  });
}

export async function sendStrategyApprovedByClientEmail(opts: {
  to: string | string[];
  clientName: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Strategy Approved — ${opts.clientName}`,
    html: baseEmail({
      title: "Strategy Approved by Client",
      body: `<strong>${opts.clientName}</strong> has approved their brand strategy. Content generation and community management can now begin.`,
    }),
  });
}

export async function sendContentAwaitingApprovalEmail(opts: {
  to: string;
  clientName: string;
  magicLink: string;
  itemTitle: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `New Content Awaiting Your Approval — ${opts.clientName}`,
    html: baseEmail({
      title: "New Content to Review",
      body: `A new item <strong>"${opts.itemTitle}"</strong> for <strong>${opts.clientName}</strong> is awaiting your approval in the client portal.`,
      cta: { text: "Review Content", url: opts.magicLink },
    }),
  });
}

export async function sendContentApprovedEmail(opts: {
  to: string | string[];
  clientName: string;
  itemTitle: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Content Approved — ${opts.clientName}`,
    html: baseEmail({
      title: "Content Approved",
      body: `<strong>${opts.clientName}</strong> approved <strong>"${opts.itemTitle}"</strong>. It will be scheduled for publishing.`,
    }),
  });
}

export async function sendContentPublishedEmail(opts: {
  to: string;
  clientName: string;
  itemTitle: string;
  publishedUrl?: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Content Published — ${opts.clientName}`,
    html: baseEmail({
      title: "Your Content is Live",
      body: `<strong>"${opts.itemTitle}"</strong> for <strong>${opts.clientName}</strong> has been published.${opts.publishedUrl ? ` <a href="${opts.publishedUrl}" style="color:#2F5D62">View it here</a>.` : ""}`,
    }),
  });
}

export async function sendFunnelConversionEmail(opts: {
  to?: string;
  clientName: string;
  leadHandle: string;
  platform: string;
  conversationUrl?: string;
}) {
  return sendEmail({
    to: opts.to ?? "hello@getpostflow.com",
    subject: `High-Intent Lead — ${opts.clientName} (${opts.platform})`,
    html: baseEmail({
      title: "Funnel Conversion Alert",
      body: `A high-intent lead <strong>${opts.leadHandle}</strong> on <strong>${opts.platform}</strong> for <strong>${opts.clientName}</strong> has reached the conversion stage. Immediate human follow-up is recommended.`,
      cta: opts.conversationUrl ? { text: "View Conversation", url: opts.conversationUrl } : undefined,
    }),
  });
}
