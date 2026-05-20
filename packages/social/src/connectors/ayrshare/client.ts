/**
 * Ayrshare REST API client.
 *
 * Auth:   Bearer AYRSHARE_API_KEY
 * Base:   AYRSHARE_BASE_URL (default https://app.ayrshare.com/api)
 * Docs:   https://docs.ayrshare.com/
 *
 * Supports multi-profile mode via an optional `profileKey` parameter on each
 * call — see https://docs.ayrshare.com/profiles/manage-profiles
 */

// ─── Config ──────────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  return (
    (typeof process !== "undefined" && process.env?.AYRSHARE_BASE_URL) ||
    "https://app.ayrshare.com/api"
  );
}

function getApiKey(): string {
  const key =
    typeof process !== "undefined" && process.env?.AYRSHARE_API_KEY;
  if (!key) throw new Error("AYRSHARE_API_KEY env var is not set");
  return key;
}

// ─── Low-level fetch helper ───────────────────────────────────────────────────

async function ayrshareRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  profileKey?: string
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getApiKey()}`,
  };
  if (profileKey) {
    headers["Profile-Key"] = profileKey;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = JSON.stringify(errBody);
    } catch {
      detail = await res.text();
    }
    throw new AyrshareApiError(res.status, path, detail);
  }

  return res.json() as Promise<T>;
}

// ─── Error type ───────────────────────────────────────────────────────────────

export class AyrshareApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly path: string,
    public readonly detail: string
  ) {
    super(`Ayrshare API error ${statusCode} on ${path}: ${detail}`);
    this.name = "AyrshareApiError";
  }
}

// ─── Request / response types ─────────────────────────────────────────────────

export type AyrsharePlatform =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "pinterest"
  | "reddit"
  | "discord"
  | "twitter"
  | "gmb"
  | string;

export interface AyrsharePostRequest {
  post: string;
  platforms: AyrsharePlatform[];
  mediaUrls?: string[];
  scheduleDate?: string; // ISO 8601
  shortenLinks?: boolean;
  isVideo?: boolean;
  youTubeOptions?: {
    title?: string;
    description?: string;
    visibility?: "public" | "private" | "unlisted";
    categoryId?: string;
    madeForKids?: boolean;
    shorts?: boolean;
  };
  instagramOptions?: {
    reelVideo?: boolean;
    story?: boolean;
  };
  tiktokOptions?: {
    privacyLevel?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "SELF_ONLY";
  };
  linkedInOptions?: {
    visibility?: "PUBLIC" | "CONNECTIONS";
  };
  pinterestOptions?: {
    boardId?: string;
    link?: string;
    altText?: string;
  };
  redditOptions?: {
    subreddit?: string;
    title?: string;
  };
  discordOptions?: {
    channelId?: string;
  };
  profileKey?: string; // Ayrshare profile key override
  /** Catch-all for platform-specific options not yet typed */
  [key: string]: unknown;
}

export interface AyrsharePostResponse {
  id: string;
  status: string;
  errors?: Array<{ platform: string; msg: string }>;
  postIds?: Array<{ platform: string; id: string; postUrl?: string }>;
  scheduleDate?: string;
  /** Raw response passthrough */
  [key: string]: unknown;
}

export interface AyrshareAnalyticsRequest {
  id: string; // Ayrshare post id
  platforms: AyrsharePlatform[];
}

export interface AyrshareAnalyticsMetric {
  name: string;
  value: number;
}

export interface AyrshareAnalyticsResponse {
  id: string;
  analytics: Record<string, AyrshareAnalyticsMetric[]>;
  [key: string]: unknown;
}

export interface AyrshareComment {
  id: string;
  comment: string;
  username: string;
  timestamp: string; // ISO 8601
  platform: string;
  [key: string]: unknown;
}

export interface AyrshareCommentsResponse {
  comments: AyrshareComment[];
  [key: string]: unknown;
}

export interface AyrshareReplyRequest {
  id: string; // comment / message id to reply to
  comment: string;
  platforms: AyrsharePlatform[];
}

export interface AyrshareReplyResponse {
  status: string;
  replyId?: string;
  [key: string]: unknown;
}

export interface AyrshareUserResponse {
  profileKey: string;
  activeSocialAccounts?: string[];
  displayName?: string;
  [key: string]: unknown;
}

// ─── Typed API surface ────────────────────────────────────────────────────────

/**
 * POST /post  — publish or schedule a post on one or more platforms.
 */
export async function postContent(
  req: AyrsharePostRequest,
  profileKey?: string
): Promise<AyrsharePostResponse> {
  const payload = profileKey ? { ...req, profileKey } : req;
  return ayrshareRequest<AyrsharePostResponse>("POST", "/post", payload, profileKey);
}

/**
 * GET /analytics?id=<postId>&platforms=<csv>
 */
export async function getAnalytics(
  postId: string,
  platforms: AyrsharePlatform[],
  profileKey?: string
): Promise<AyrshareAnalyticsResponse> {
  const qs = `id=${encodeURIComponent(postId)}&platforms=${platforms.join(",")}`;
  return ayrshareRequest<AyrshareAnalyticsResponse>(
    "GET",
    `/analytics?${qs}`,
    undefined,
    profileKey
  );
}

/**
 * GET /comments?id=<postId>&platforms=<csv>
 */
export async function getComments(
  postId: string,
  platforms: AyrsharePlatform[],
  profileKey?: string
): Promise<AyrshareCommentsResponse> {
  const qs = `id=${encodeURIComponent(postId)}&platforms=${platforms.join(",")}`;
  return ayrshareRequest<AyrshareCommentsResponse>(
    "GET",
    `/comments?${qs}`,
    undefined,
    profileKey
  );
}

/**
 * POST /comments/reply  — reply to a comment / message.
 */
export async function replyToComment(
  req: AyrshareReplyRequest,
  profileKey?: string
): Promise<AyrshareReplyResponse> {
  return ayrshareRequest<AyrshareReplyResponse>(
    "POST",
    "/comments/reply",
    req,
    profileKey
  );
}

/**
 * GET /user  — fetch the authenticated profile / user info.
 */
export async function getUser(profileKey?: string): Promise<AyrshareUserResponse> {
  return ayrshareRequest<AyrshareUserResponse>(
    "GET",
    "/user",
    undefined,
    profileKey
  );
}
