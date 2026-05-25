/**
 * Inbox sync helpers — Phase 5
 *
 * Sentiment classification using a lightweight keyword heuristic.
 * In production this would call openai moderation + a structured
 * classification prompt. The stub path is used when AI_STUB_MODE=true.
 */

export type SentimentLabel = "positive" | "neutral" | "negative" | "urgent";

const URGENT_KEYWORDS = [
  "urgent", "emergency", "asap", "immediately", "crisis", "critical",
  "now!", "help!", "please help", "going to sue", "lawyer", "fraud",
];

const NEGATIVE_KEYWORDS = [
  "terrible", "horrible", "awful", "worst", "hate", "disgusting", "scam",
  "refund", "complaint", "angry", "disappointed", "unacceptable", "ridiculous",
  "never again", "do not recommend", "waste", "broken", "failed",
];

const POSITIVE_KEYWORDS = [
  "love", "amazing", "great", "excellent", "fantastic", "awesome",
  "wonderful", "best", "thank you", "thanks", "appreciate", "perfect",
  "recommend", "five stars", "brilliant",
];

/**
 * Classify sentiment of a message body.
 * Returns a SentimentLabel and a confidence 0-100.
 */
export function classifySentiment(text: string): {
  sentiment: SentimentLabel;
  confidence: number;
} {
  const lower = text.toLowerCase();

  for (const kw of URGENT_KEYWORDS) {
    if (lower.includes(kw)) {
      return { sentiment: "urgent", confidence: 88 };
    }
  }

  const negCount = NEGATIVE_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  const posCount = POSITIVE_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  if (negCount > posCount && negCount > 0) {
    const confidence = Math.min(60 + negCount * 10, 92);
    return { sentiment: "negative", confidence };
  }

  if (posCount > 0) {
    const confidence = Math.min(65 + posCount * 8, 92);
    return { sentiment: "positive", confidence };
  }

  return { sentiment: "neutral", confidence: 70 };
}

/**
 * Generate an AI-suggested reply stub.
 * In production: calls content-engine with brand profile + platform context.
 */
export function generateSuggestedReply(
  message: string,
  sentiment: SentimentLabel,
  platform: string,
  brandName = "our team",
): string {
  if (platform === "reddit") {
    return "Manual response required — community guidelines";
  }

  if (sentiment === "urgent" || sentiment === "negative") {
    return `Hi there! ${brandName} takes this seriously and we want to make things right. A member of our team will reach out shortly to resolve this for you.`;
  }

  if (sentiment === "positive") {
    return `Thank you so much! We really appreciate your kind words — it means a lot to us. Stay tuned for more!`;
  }

  const lc = message.toLowerCase();
  if (lc.includes("hour") || lc.includes("open") || lc.includes("close")) {
    return `Great question! Our hours are posted in our profile bio. Feel free to DM us if you need anything else.`;
  }
  if (lc.includes("price") || lc.includes("cost") || lc.includes("how much")) {
    return `Thanks for your interest! Please check our website or DM us for the latest pricing information.`;
  }

  return `Thanks for reaching out! We'll get back to you as soon as possible. Have a great day!`;
}

/**
 * Determine if a message should be auto-escalated based on sentiment.
 * Negative and urgent messages are always escalated.
 */
export function shouldEscalate(sentiment: SentimentLabel): boolean {
  return sentiment === "negative" || sentiment === "urgent";
}
