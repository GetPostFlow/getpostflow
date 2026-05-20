# @getpostflow/social

Social media connector layer for GetPostFlow. Provides a unified `Connector` interface over multiple platforms, with a **hybrid routing model** that defaults to [Ayrshare](https://www.ayrshare.com/) while direct platform API approvals are being processed.

---

## Architecture: Hybrid Provider Model

```
getConnector(platform)
        │
        ▼
 resolveProvider()
   ┌────────────────────────────────────────┐
   │  1. opts.provider (caller override)    │
   │  2. SOCIAL_PROVIDER_<PLATFORM> env var │
   │  3. SOCIAL_PROVIDER_DEFAULT env var    │
   │  4. "ayrshare" (v1 hard default)       │
   └────────────────────────────────────────┘
        │
   ┌────┴────┐
   │         │
ayrshare   direct
registry   registry
   │         │
AyrshareXxx  XxxConnector
(Ayrshare    (native platform
 REST API)    OAuth API)
```

### v1 Launch Default

All platforms default to `ayrshare` via `SOCIAL_PROVIDER_DEFAULT=ayrshare`. This lets the product ship immediately using Ayrshare as a proxy while each platform's developer app review is in progress.

### Per-Platform Migration Path

Once a platform's native API credentials are approved, switch it to direct by setting the environment variable:

```bash
# In .env.local or production secrets:
SOCIAL_PROVIDER_REDDIT=direct
SOCIAL_PROVIDER_FACEBOOK=direct
# etc.
```

No code changes required — the registry picks it up automatically at startup.

### Caller Override

For one-off calls (e.g. admin tools, migrations), pass `provider` directly:

```ts
import { getConnector } from "@getpostflow/social";

const connector = getConnector("facebook", { provider: "direct" });
```

---

## Connector Interface

All connectors implement:

```ts
interface Connector {
  readonly platform: string;
  authenticate(orgId: string, code: string): Promise<OAuthTokens>;
  refreshToken(token: OAuthTokens): Promise<OAuthTokens>;
  publishPost(post: PostPayload): Promise<PublishResult>;
  schedulePost(post: PostPayload, when: number): Promise<ScheduleResult>;
  fetchAnalytics(postId: string, range: DateRange): Promise<AnalyticsBundle>;
  fetchInbox(orgId: string, since: number): Promise<Message[]>;
  replyToMessage(threadId: string, content: string): Promise<ReplyResult>;
}
```

---

## Ayrshare Connector Coverage

| Platform        | publishPost | schedulePost | fetchAnalytics | fetchInbox       | replyToMessage      |
|-----------------|-------------|--------------|----------------|------------------|---------------------|
| Facebook        | Full        | Full         | Full           | Empty list ¹     | Post comments only  |
| Instagram       | Full        | Full         | Full           | NotImplemented ² | Post comments only  |
| TikTok          | Full        | Full         | Partial ³      | NotImplemented   | NotImplemented      |
| YouTube         | Full        | Full         | Partial ⁴      | Empty list ¹     | Post comments       |
| YouTube Shorts  | Full        | Full         | Partial ⁴      | Empty list ¹     | Post comments       |
| LinkedIn        | Full        | Full         | Partial ⁵      | NotImplemented ⁶ | NotImplemented ⁶    |
| Pinterest       | Full        | Full         | Partial ⁷      | NotImplemented   | NotImplemented      |
| Reddit          | Full        | Full         | Limited ⁸      | NotImplemented   | **HARD BLOCK** ⁹    |
| Discord         | Full        | Full         | NotImplemented | NotImplemented   | NotImplemented      |

**Notes:**

1. Ayrshare does not expose a time-ranged inbox feed by org. Returns empty; integrate direct API for inbox polling.
2. Instagram DMs require the Meta Messenger Platform (separate approval).
3. TikTok: basic engagement metrics only, no TikTok Ads Manager depth.
4. YouTube: views/likes via Ayrshare; YouTube Studio deep analytics require direct Google OAuth.
5. LinkedIn: impressions/clicks/reactions; full audience demographics require Marketing Developer Program access.
6. LinkedIn messaging API requires Marketing Developer Program partner approval.
7. Pinterest: impressions/saves/clicks; no audience data.
8. Reddit: upvotes/comment counts only.
9. **Reddit `replyToMessage` always throws `RedditAutoResponseBlockedError`** — v1 policy, regardless of provider. All Reddit replies require human approval.

### Platforms to migrate to direct API first

Priority order based on Ayrshare coverage gaps:

1. **Discord** — no analytics, no inbox, no reply (bot integration needed first)
2. **LinkedIn** — no inbox/DMs (Marketing Developer Program required)
3. **Instagram** — no DM inbox (Messenger Platform approval needed)
4. **Reddit** — inbox/comments/modmail (direct API required for inbox)
5. **TikTok** — fuller analytics, inbox (TikTok Business API review)
6. **YouTube** — YouTube Studio analytics depth
7. **Facebook** — DM inbox (Messenger Platform)
8. **Pinterest** — audience analytics
9. **LinkedIn** — already migrated above; remaining audience data

---

## Ayrshare Profile Mapping

Ayrshare uses a **Profile Key** to scope API calls to a specific connected account set (one per brand/client). Profile keys are stored in the `social_account_profiles` table in `@getpostflow/db`.

```ts
import { createDb } from "@getpostflow/db";
import { createProfile, connectAccount, getProfileByOrg } from "@getpostflow/db";

const db = createDb();

// 1. Create a new Ayrshare profile for an org (call POST /profiles on Ayrshare first)
const profile = await createProfile(db, orgId, ayrshareProfileKey);

// 2. Record a platform connection after OAuth
await connectAccount(db, profile.ayrshareProfileKey, "facebook", oauthTokens);

// 3. Look up the profile key when making API calls
const { ayrshareProfileKey } = await getProfileByOrg(db, orgId);
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AYRSHARE_API_KEY` | Yes (for Ayrshare) | — | Ayrshare API key from dashboard |
| `AYRSHARE_BASE_URL` | No | `https://app.ayrshare.com/api` | Override for staging/testing |
| `SOCIAL_PROVIDER_DEFAULT` | No | `ayrshare` | Default provider for all platforms |
| `SOCIAL_PROVIDER_<PLATFORM>` | No | falls back to `SOCIAL_PROVIDER_DEFAULT` | Per-platform override |

Platform keys for env vars use uppercase with underscores: `FACEBOOK`, `INSTAGRAM`, `TIKTOK`, `YOUTUBE`, `YOUTUBE_SHORTS`, `LINKEDIN`, `PINTEREST`, `REDDIT`, `DISCORD`.

---

## Reddit Policy

**Reddit auto-responses are blocked in v1.**

`replyToMessage` on any Reddit connector (both `RedditConnector` and `AyrshareRedditConnector`) always throws `RedditAutoResponseBlockedError`. This is enforced in code and is not configurable via environment variables or caller overrides. All Reddit replies must go through the human approval workflow.

See `packages/social/src/policies.ts` for the broader `reddit-override` category policy.

---

## Running Tests

```bash
pnpm --filter @getpostflow/social test
pnpm --filter @getpostflow/social typecheck
```
