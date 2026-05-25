/**
 * Email Templates for GetPostFlow
 * All templates enforce NO EM DASHES rule (use hyphens instead)
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Welcome email sent after successful payment
 */
export function welcomeEmail(clientName: string, portalUrl: string): EmailTemplate {
  return {
    subject: `Welcome to GetPostFlow, ${clientName}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Welcome to GetPostFlow!</h1>
        <p>Hi ${clientName},</p>
        <p>Thank you for joining GetPostFlow. We're excited to help you grow your social media presence.</p>
        <p>Your account is now active. To get started, please log into your client portal:</p>
        <p><a href="${portalUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2F5D62; color: white; text-decoration: none; border-radius: 6px;">Access Your Portal</a></p>
        <p>In your portal, you'll be able to:</p>
        <ul>
          <li>Complete your brand intake form</li>
          <li>Review your brand strategy</li>
          <li>Approve content before it's published</li>
          <li>Communicate with your account manager</li>
          <li>View your billing information</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The GetPostFlow Team</p>
      </div>
    `,
    text: `
Welcome to GetPostFlow!

Hi ${clientName},

Thank you for joining GetPostFlow. We're excited to help you grow your social media presence.

Your account is now active. To get started, please log into your client portal:
${portalUrl}

In your portal, you'll be able to:
- Complete your brand intake form
- Review your brand strategy
- Approve content before it's published
- Communicate with your account manager
- View your billing information

If you have any questions, feel free to reach out to our support team.

Best regards,
The GetPostFlow Team
    `,
  };
}

/**
 * Strategy approval notification sent to client
 */
export function strategyApprovalEmail(
  clientName: string,
  portalUrl: string,
  strategyType: string
): EmailTemplate {
  return {
    subject: `Your ${strategyType} Strategy is Ready for Review`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Your ${strategyType} Strategy is Ready</h1>
        <p>Hi ${clientName},</p>
        <p>Great news! Your ${strategyType} strategy has been created and is ready for your review.</p>
        <p>Our team has analyzed your brand, website, and goals to create a customized strategy that will help you achieve your social media objectives.</p>
        <p><a href="${portalUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2F5D62; color: white; text-decoration: none; border-radius: 6px;">Review Your Strategy</a></p>
        <p>Once you approve the strategy, we'll begin creating content tailored to your brand.</p>
        <p>Questions? Contact your account manager through your portal.</p>
        <p>Best regards,<br>The GetPostFlow Team</p>
      </div>
    `,
    text: `
Your ${strategyType} Strategy is Ready

Hi ${clientName},

Great news! Your ${strategyType} strategy has been created and is ready for your review.

Our team has analyzed your brand, website, and goals to create a customized strategy that will help you achieve your social media objectives.

Review your strategy here: ${portalUrl}

Once you approve the strategy, we'll begin creating content tailored to your brand.

Questions? Contact your account manager through your portal.

Best regards,
The GetPostFlow Team
    `,
  };
}

/**
 * Content approval notification sent to client
 */
export function contentApprovalEmail(
  clientName: string,
  portalUrl: string,
  contentCount: number
): EmailTemplate {
  return {
    subject: `${contentCount} New Post(s) Ready for Your Approval`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>New Content Ready for Review</h1>
        <p>Hi ${clientName},</p>
        <p>Your team has created ${contentCount} new post(s) that are ready for your approval.</p>
        <p>Review the content in your portal to approve or request changes:</p>
        <p><a href="${portalUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2F5D62; color: white; text-decoration: none; border-radius: 6px;">Review Content</a></p>
        <p>Once approved, the content will be scheduled and published according to your posting calendar.</p>
        <p>Best regards,<br>The GetPostFlow Team</p>
      </div>
    `,
    text: `
New Content Ready for Review

Hi ${clientName},

Your team has created ${contentCount} new post(s) that are ready for your approval.

Review the content in your portal to approve or request changes:
${portalUrl}

Once approved, the content will be scheduled and published according to your posting calendar.

Best regards,
The GetPostFlow Team
    `,
  };
}

/**
 * Portal message notification sent to internal team
 */
export function portalMessageNotificationEmail(
  teamMemberName: string,
  clientName: string,
  messagePreview: string,
  portalUrl: string
): EmailTemplate {
  return {
    subject: `New Message from ${clientName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>New Client Message</h1>
        <p>Hi ${teamMemberName},</p>
        <p>${clientName} has sent you a new message:</p>
        <p style="padding: 12px; background-color: #f3f4f6; border-left: 4px solid #2F5D62; margin: 16px 0;">
          "${messagePreview}"
        </p>
        <p><a href="${portalUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2F5D62; color: white; text-decoration: none; border-radius: 6px;">View Full Message</a></p>
        <p>Best regards,<br>GetPostFlow</p>
      </div>
    `,
    text: `
New Client Message

Hi ${teamMemberName},

${clientName} has sent you a new message:

"${messagePreview}"

View the full message here: ${portalUrl}

Best regards,
GetPostFlow
    `,
  };
}

/**
 * High-intent lead notification sent to account manager
 */
export function highIntentLeadEmail(
  accountManagerName: string,
  clientName: string,
  platform: string,
  senderHandle: string,
  messagePreview: string,
  inboxUrl: string
): EmailTemplate {
  return {
    subject: `High-Intent Lead from ${senderHandle} on ${platform}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>High-Intent Lead Detected</h1>
        <p>Hi ${accountManagerName},</p>
        <p>A high-intent engagement has been detected for ${clientName} on ${platform}.</p>
        <p><strong>From:</strong> ${senderHandle}</p>
        <p><strong>Platform:</strong> ${platform}</p>
        <p><strong>Message:</strong></p>
        <p style="padding: 12px; background-color: #f3f4f6; border-left: 4px solid #dc2626; margin: 16px 0;">
          "${messagePreview}"
        </p>
        <p><a href="${inboxUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px;">Review in Inbox</a></p>
        <p>This lead requires immediate attention. Please follow up as soon as possible.</p>
        <p>Best regards,<br>GetPostFlow</p>
      </div>
    `,
    text: `
High-Intent Lead Detected

Hi ${accountManagerName},

A high-intent engagement has been detected for ${clientName} on ${platform}.

From: ${senderHandle}
Platform: ${platform}

Message:
"${messagePreview}"

Review in inbox: ${inboxUrl}

This lead requires immediate attention. Please follow up as soon as possible.

Best regards,
GetPostFlow
    `,
  };
}
