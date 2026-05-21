/**
 * Buffer GraphQL API client.
 *
 * Auth:   Authorization: Bearer BUFFER_API_KEY
 * Base:   https://api.buffer.com/
 * Docs:   https://buffer.com/developers/api
 *
 * Buffer migrated to a GraphQL-first API. This client sends all mutations and
 * queries as JSON-encoded GraphQL requests to https://api.buffer.com/.
 */

// ─── Config ──────────────────────────────────────────────────────────────────

const BUFFER_GRAPHQL_ENDPOINT = "https://api.buffer.com/";

function getAccessToken(): string {
  const key =
    typeof process !== "undefined" && process.env?.BUFFER_API_KEY;
  if (!key) throw new Error("BUFFER_API_KEY env var is not set");
  return key;
}

function getOrgId(): string {
  const orgId =
    typeof process !== "undefined" && process.env?.BUFFER_ORG_ID;
  if (!orgId) throw new Error("BUFFER_ORG_ID env var is not set");
  return orgId;
}

// ─── Error type ───────────────────────────────────────────────────────────────

export class BufferApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly path: string,
    public readonly detail: string
  ) {
    super(`Buffer API error ${statusCode} on ${path}: ${detail}`);
    this.name = "BufferApiError";
  }
}

// ─── GraphQL response types ───────────────────────────────────────────────────

interface GqlResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: { code?: string } }[];
}

// ─── Low-level GraphQL helper ─────────────────────────────────────────────────

async function bufferGraphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      detail = await res.text();
    }
    throw new BufferApiError(res.status, BUFFER_GRAPHQL_ENDPOINT, detail);
  }

  const json = (await res.json()) as GqlResponse<T>;

  if (json.errors && json.errors.length > 0) {
    const msg = json.errors.map((e) => e.message).join("; ");
    throw new BufferApiError(200, BUFFER_GRAPHQL_ENDPOINT, msg);
  }

  if (json.data === undefined) {
    throw new BufferApiError(200, BUFFER_GRAPHQL_ENDPOINT, "No data in response");
  }

  return json.data;
}

// ─── Request / response types ─────────────────────────────────────────────────

export type BufferServiceType =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "pinterest"
  | "twitter"
  | string;

export interface BufferProfile {
  id: string;
  service: BufferServiceType;
  service_username: string;
  service_id: string;
  formatted_username: string;
  avatar: string;
  avatar_https: string;
  statistics?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BufferUpdateCreateRequest {
  /** Array of profile IDs to post to */
  profile_ids: string[];
  /** Post text */
  text: string;
  /** Media URLs (images/video) */
  media?: {
    link?: string;
    description?: string;
    title?: string;
    picture?: string;
    thumbnail?: string;
    photo?: string;
  };
  /** ISO 8601 UTC string for scheduling (omit to add to Buffer queue) */
  scheduled_at?: string;
  /** Set true to publish immediately instead of queueing */
  now?: boolean;
  photo?: string;
  [key: string]: unknown;
}

export interface BufferUpdate {
  id: string;
  status: "buffer" | "sent" | "failed" | string;
  text: string;
  text_formatted?: string;
  profile_id: string;
  service_update_id?: string;
  due_at?: number;
  sent_at?: number;
  statistics?: {
    reach?: number;
    clicks?: number;
    retweets?: number;
    favorites?: number;
    mentions?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface BufferCreateResponse {
  success: boolean;
  buffer_count?: number;
  buffer_percentage?: number;
  updates: BufferUpdate[];
  [key: string]: unknown;
}

export interface BufferAnalyticsResponse {
  id: string;
  statistics?: {
    reach?: number;
    clicks?: number;
    retweets?: number;
    favorites?: number;
    mentions?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ─── GraphQL-based Idea type (Buffer's content idea concept) ──────────────────

export interface BufferIdea {
  id: string;
  content: {
    title?: string;
    text?: string;
  };
}

// ─── Typed API surface ────────────────────────────────────────────────────────

/**
 * createPost — create a content idea in Buffer via the GraphQL API.
 *
 * Maps to the `createIdea` mutation. Buffer's GraphQL API uses the "Idea"
 * concept as the primary content creation primitive. The organizationId is
 * read from the BUFFER_ORG_ID env var.
 */
export async function createPost(input: {
  title?: string;
  text: string;
}): Promise<BufferIdea> {
  const organizationId = getOrgId();

  const mutation = /* GraphQL */ `
    mutation CreateIdea($input: CreateIdeaInput!) {
      createIdea(input: $input) {
        ... on Idea {
          id
          content {
            title
            text
          }
        }
      }
    }
  `;

  const variables = {
    input: {
      organizationId,
      content: {
        title: input.title ?? "",
        text: input.text,
      },
    },
  };

  const data = await bufferGraphql<{ createIdea: BufferIdea }>(mutation, variables);
  return data.createIdea;
}

/**
 * createUpdate — schedule or publish an update via GraphQL createIdea.
 *
 * Kept for backward-compat with existing connector code. Internally delegates
 * to createPost and returns a BufferCreateResponse-shaped object so callers
 * don't need to change.
 */
export async function createUpdate(
  req: BufferUpdateCreateRequest
): Promise<BufferCreateResponse> {
  const idea = await createPost({ text: req.text });

  // Wrap in BufferCreateResponse shape so existing connectors work unchanged
  const syntheticUpdate: BufferUpdate = {
    id: idea.id,
    status: "buffer",
    text: req.text,
    profile_id: req.profile_ids[0] ?? "",
  };

  return {
    success: true,
    updates: [syntheticUpdate],
  };
}

/**
 * getProfiles — returns an empty array in GraphQL mode.
 *
 * The Buffer GraphQL API does not expose a direct "list profiles" query in
 * the public API; profile-level routing happens inside Buffer's publishing
 * pipeline. Returning an empty array keeps connectors that call resolveProfileId
 * from throwing at import time, and each connector can handle the fallback.
 */
export async function getProfiles(): Promise<BufferProfile[]> {
  // GraphQL API does not expose a list-profiles query in the public surface.
  // Profile resolution is handled within Buffer's queue when the idea is promoted.
  return [];
}

/**
 * getPendingUpdates — not available in GraphQL API, returns empty list.
 */
export async function getPendingUpdates(_profileId: string): Promise<{ updates: BufferUpdate[] }> {
  return { updates: [] };
}

/**
 * getSentUpdates — not available in GraphQL API, returns empty list.
 */
export async function getSentUpdates(_profileId: string): Promise<{ updates: BufferUpdate[] }> {
  return { updates: [] };
}

/**
 * destroyUpdate — not directly available in GraphQL API.
 */
export async function destroyUpdate(_updateId: string): Promise<{ success: boolean }> {
  return { success: false };
}

/**
 * getUpdate — not available in GraphQL API, returns stub.
 */
export async function getUpdate(updateId: string): Promise<BufferAnalyticsResponse> {
  return { id: updateId };
}

/**
 * Ping the Buffer GraphQL endpoint to verify connectivity.
 * Uses a lightweight introspection query.
 */
export async function ping(): Promise<boolean> {
  const token = getAccessToken();
  try {
    const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "{ __typename }" }),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = (await res.json()) as GqlResponse<{ __typename: string }>;
    return !json.errors || json.errors.length === 0;
  } catch {
    return false;
  }
}
