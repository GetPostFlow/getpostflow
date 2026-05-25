/**
 * Community Management Funnel Logic
 * Implements automated engagement strategies across Awareness, Interest, and Conversion stages
 */

export interface FunnelContext {
  clientId: string;
  platform: string;
  commentText: string;
  senderHandle: string;
  postCaption: string;
  brandVoice: string;
  funnelRules: {
    awareness: string[];
    interest: string[];
    conversion: string[];
  };
  keywordsToMonitor: string[];
  responseGuidelines: string;
}

export interface FunnelDecision {
  stage: "awareness" | "interest" | "conversion" | "escalate";
  action: "like" | "reply" | "dm" | "flag" | "none";
  suggestedResponse?: string;
  confidence: number;
  reasoning: string;
}

/**
 * Analyzes a comment and determines the appropriate funnel stage and action
 */
export function analyzeFunnelStage(context: FunnelContext): FunnelDecision {
  const commentLower = context.commentText.toLowerCase();

  // Check for high-intent keywords (Conversion stage)
  const conversionKeywords = [
    "how much",
    "price",
    "cost",
    "buy",
    "purchase",
    "order",
    "link",
    "where can i",
    "how do i get",
    "interested",
    "sign up",
    "demo",
    "trial",
    "free trial",
  ];

  if (conversionKeywords.some((kw) => commentLower.includes(kw))) {
    return {
      stage: "conversion",
      action: "flag",
      confidence: 0.95,
      reasoning: "High-intent keywords detected. Flagging for account manager review.",
      suggestedResponse: generateConversionResponse(context),
    };
  }

  // Check for question keywords (Interest stage)
  const questionKeywords = [
    "how",
    "what",
    "why",
    "when",
    "where",
    "can you",
    "do you",
    "question",
    "help",
    "advice",
  ];

  if (questionKeywords.some((kw) => commentLower.includes(kw))) {
    return {
      stage: "interest",
      action: "reply",
      confidence: 0.85,
      reasoning: "Question detected. Generating informative response.",
      suggestedResponse: generateInterestResponse(context),
    };
  }

  // Check for positive sentiment (Awareness stage)
  const positiveKeywords = [
    "love",
    "great",
    "awesome",
    "amazing",
    "excellent",
    "perfect",
    "thanks",
    "thank you",
    "appreciate",
    "nice",
    "cool",
    "good",
  ];

  if (positiveKeywords.some((kw) => commentLower.includes(kw))) {
    return {
      stage: "awareness",
      action: "like",
      confidence: 0.9,
      reasoning: "Positive sentiment detected. Liking comment to boost visibility.",
    };
  }

  // Check for monitored keywords
  if (context.keywordsToMonitor.some((kw) => commentLower.includes(kw.toLowerCase()))) {
    return {
      stage: "interest",
      action: "reply",
      confidence: 0.75,
      reasoning: "Monitored keyword detected in comment.",
      suggestedResponse: generateInterestResponse(context),
    };
  }

  // Default: generic engagement
  return {
    stage: "awareness",
    action: "like",
    confidence: 0.6,
    reasoning: "Generic comment. Liking to maintain engagement.",
  };
}

/**
 * Generates a response for Awareness stage (praise and generic engagement)
 */
function generateAwarenessResponse(context: FunnelContext): string {
  const responses = [
    "Thank you so much for the kind words!",
    "We appreciate the love!",
    "Thanks for the support!",
    "So glad you enjoyed this!",
    "Thank you for being part of our community!",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generates a response for Interest stage (informative with soft CTA)
 */
function generateInterestResponse(context: FunnelContext): string {
  // NO EM DASHES - use hyphens instead
  const responses = [
    "Great question! We'd love to help. Check out our link in bio for more details.",
    "Thanks for asking! You can find more information in our bio.",
    "That's a great point - here's what we recommend: check our latest post for more insights.",
    "Love this question! Feel free to reach out via DM for personalized help.",
    "We're here to help! Visit our website (link in bio) for more resources.",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generates a response for Conversion stage (direct CTA)
 */
function generateConversionResponse(context: FunnelContext): string {
  // NO EM DASHES - use hyphens instead
  const responses = [
    "Excited to help! Slide into our DMs or click the link in bio to get started.",
    "Perfect timing! Check out our link in bio to learn more and get started today.",
    "We'd love to work with you! Visit our website or send us a DM for details.",
    "Great to hear from you! Our team is ready to help - reach out via DM or our website.",
    "Let's make it happen! Check our bio for next steps or send us a message.",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Determines if a comment should be escalated to account manager
 */
export function shouldEscalate(context: FunnelContext, decision: FunnelDecision): boolean {
  // Escalate if:
  // 1. High-intent conversion keywords
  // 2. Negative sentiment detected
  // 3. Spam or suspicious activity
  // 4. Sensitive topics

  const negativeKeywords = [
    "scam",
    "fraud",
    "fake",
    "hate",
    "terrible",
    "awful",
    "worst",
    "complaint",
    "problem",
  ];

  const commentLower = context.commentText.toLowerCase();

  if (negativeKeywords.some((kw) => commentLower.includes(kw))) {
    return true;
  }

  if (decision.stage === "conversion") {
    return true;
  }

  return false;
}

/**
 * Generates a notification for account manager when escalation is needed
 */
export function generateEscalationNotification(
  context: FunnelContext,
  decision: FunnelDecision
): {
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
} {
  const priority = decision.stage === "conversion" ? "high" : "medium";

  return {
    title: `New ${decision.stage} stage engagement from ${context.senderHandle}`,
    message: `Comment: "${context.commentText.substring(0, 100)}..." on ${context.platform}. Action: ${decision.action}. Suggested response: ${decision.suggestedResponse || "N/A"}`,
    priority,
  };
}

/**
 * Batch processes multiple comments for a client
 */
export function processFunnelBatch(
  comments: Array<Omit<FunnelContext, "funnelRules" | "keywordsToMonitor" | "responseGuidelines">>,
  sharedContext: {
    funnelRules: FunnelContext["funnelRules"];
    keywordsToMonitor: FunnelContext["keywordsToMonitor"];
    responseGuidelines: FunnelContext["responseGuidelines"];
  }
): FunnelDecision[] {
  return comments.map((comment) =>
    analyzeFunnelStage({
      ...comment,
      ...sharedContext,
    })
  );
}
