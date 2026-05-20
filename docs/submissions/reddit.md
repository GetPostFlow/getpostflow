# Reddit — Submission Playbook
<!-- Source: https://www.reddit.com/wiki/api -->

> **CRITICAL PRODUCT POLICY — REDDIT AUTO-RESPONSE IS HARD-BLOCKED:**
> Per GetPostFlow Architecture Plan v3, **all Reddit interactions require human approval in every product tier and every engagement category — without exception.** Even when the global auto-engagement policy would permit auto-response for a given category (e.g., FAQ replies, simple positive engagement), the Reddit platform override **always** forces suggest-and-approve mode on Reddit. GetPostFlow **never** auto-responds on Reddit. This is a non-negotiable product policy designed to protect clients from community backlash. This policy must be stated clearly in the submission, the privacy policy, and the product UI.

---

## Console URL

https://www.reddit.com/prefs/apps

Modern developer documentation: https://developers.reddit.com/docs

---

## Prerequisites

- A Reddit account (logged in) — this account becomes the app owner
- Privacy Policy live at `https://getpostflow.vercel.app/privacy`
- Terms of Service live at `https://getpostflow.vercel.app/terms`
- About URL live: `https://getpostflow.vercel.app`
- A Reddit contact account registered and noted for use in the user agent string
- GetPostFlow staging environment functional

---

## Step-by-Step

### Step 1: Create the App / Account Setup

1. Navigate to **https://www.reddit.com/prefs/apps**.
2. Ensure you are logged into the Reddit account that will own the GetPostFlow app.
3. Scroll to the bottom of the page.
4. Click **"are you a developer? create an app..."** (<!-- Verify in console: link or button at the bottom of the prefs/apps page labeled approximately "are you a developer? create an app..." -->).
5. The app creation form appears.

---

### Step 2: Configure Basic Info

Fill in the app creation form:

1. **name:** `getpostflow`
2. **App type:** select the **"web app"** radio button
3. **description:** paste the short description from the Paste-Ready Content Block (keep under 500 characters for this field)
4. **about url:** `https://getpostflow.vercel.app`
5. **redirect uri:** `https://getpostflow.vercel.app/api/oauth/reddit/callback`
6. Click **"create app"**.

After creation:
- **Client ID** is shown directly beneath the app name (a short alphanumeric string) — copy and save it securely.
- **Client Secret** is labeled **"secret"** — copy and save it securely.
- Note the app icon URL if you choose to upload one.

> **Standard access is immediately active** upon app creation — no review is required for the OAuth scopes listed below at standard rate limits.

---

### Step 3: Request Products / Add Permissions / Add Scopes

**No separate products to add** — Reddit's OAuth model grants scopes at authorization time. The scopes listed below are requested in your OAuth authorization URL and granted by the user when they connect their Reddit account.

For each scope GetPostFlow will request:

| Scope | Why GetPostFlow Needs It | Access Level |
|---|---|---|
| `identity` | Required to verify the authenticated Reddit user's identity (username) to associate the Reddit account with the correct GetPostFlow workspace. | Standard — auto-granted |
| `submit` | Required to submit link and text posts to subreddits on behalf of the authenticated user. This is the core Reddit publishing capability. Only explicitly approved content is submitted. | Standard — auto-granted |
| `read` | Required to read posts and comments on subreddits and the authenticated user's profile to surface content history and monitor post-level analytics (score, comment count). | Standard — auto-granted |
| `privatemessages` | Required to read Reddit inbox messages (replies, mentions) for the unified community inbox and to send moderation replies that have received human approval. | Standard — auto-granted |
| `history` | Required to retrieve the post history of the connected Reddit account for analytics and content history display within GetPostFlow. | Standard — auto-granted |

> **Note on scope minimalism:** GetPostFlow does not request moderator-level scopes (`modconfig`, `modposts`, `modlog`) and does not request access to vote or save actions, consistent with the principle of minimum necessary access.

---

### Step 4: OAuth / Redirect Configuration

The redirect URI was set during app creation. Verify it on the app settings page:

1. Navigate to **https://www.reddit.com/prefs/apps**.
2. Find the GetPostFlow app and click **"edit"**.
3. Confirm the redirect URI is exactly:

```
https://getpostflow.vercel.app/api/oauth/reddit/callback
```

4. Your OAuth authorization URL will use the following format — include all required scopes:

```
https://www.reddit.com/api/v1/authorize?client_id=CLIENT_ID&response_type=code&state=RANDOM_STRING&redirect_uri=https://getpostflow.vercel.app/api/oauth/reddit/callback&duration=permanent&scope=identity,submit,read,privatemessages,history
```

5. **User agent string** — all API requests from GetPostFlow must include this header in the following format (per Reddit's API terms):

```
GetPostFlow/1.0 (by /u/REDDIT_CONTACT_USERNAME)
```

> **TODO (user action required):** Register a Reddit account for GetPostFlow to use as the contact in the user agent string. Replace `REDDIT_CONTACT_USERNAME` above with the actual username.

---

### Step 5: Submit for Review (Elevated Access Only)

**Standard access** (auto-granted on app creation) is sufficient for initial development at standard rate limits. No submission is required.

**For elevated access** (higher rate limits, if post volume requires it):

1. Go to **https://support.reddithelp.com/hc/en-us/requests/new**.
2. Select category: **"API"** → **"I want to increase my API rate limit"** (<!-- Verify in console: the support form categories and subcategories labeled approximately as above -->).
3. Fill in the request form:
   - App name: `getpostflow`
   - Client ID: [your app's Client ID]
   - Use case description: paste the Extended Use Case Description from the Paste-Ready Content Block
   - Justify the rate limit increase with expected usage patterns
   - Explicitly state the human-approval requirement for all Reddit replies

> **Alternatively:** Reddit now maintains a developer platform at **https://developers.reddit.com** with documentation for the Reddit Developer Platform. Check this portal for any newer app registration paths or partnership tiers that may have launched after this document was authored.

**Demo video requirements (if requested for elevated access):**
- Length: 3–4 minutes
- Format: screen recording with voiceover
- Use a real Reddit test account
- Must explicitly show the human approval gate on all replies
- See Demo Video Script in Paste-Ready Content Block

**Screenshot list:**
1. Reddit OAuth consent screen — scopes visible during authorization
2. Connected Reddit account — account in GetPostFlow's accounts panel
3. Content composer — post type, subreddit, text/link, scheduled date
4. Approval workflow — post in "pending review" state
5. Submitted Reddit post — live on test subreddit
6. Reddit comment in unified inbox — comment surfaced in GetPostFlow
7. Reply draft with mandatory approval gate — approve/edit buttons, no auto-send indicator
8. Reply sent — reply visible on the Reddit thread
9. Analytics panel — post score and comment count
10. Disconnect account — Settings page with revocation option

**Test credentials:**

> **TODO (user action required):**
> 1. Register the Reddit developer application at https://www.reddit.com/prefs/apps.
> 2. Create a Reddit test account with a few post/comment history entries.
> 3. Connect the test account to GetPostFlow staging.
> 4. Create a test subreddit (private) or use a low-traffic subreddit for test submissions.
> 5. Provide Reddit API review (if applicable for elevated access) with:
>    - Reddit test account credentials
>    - GetPostFlow staging login credentials
>    - URL of the staging environment

---

### Step 6: Wait for Approval

- **Standard access:** Immediate — granted automatically on app creation. No waiting.
- **Elevated access timeline:** **1–3 weeks** via support request.
- **Where to track status:** Check the support ticket at https://support.reddithelp.com for elevated access requests.

**Common rejection reasons for elevated access:**
- Automated posting or replying without human involvement
- Non-compliant user agent string
- Requesting vote or mod scopes without clear justification
- Bulk subreddit data scraping patterns detected
- No human review gate demonstrated for replies

---

## Paste-Ready Content Block

### App Name
```
getpostflow
```

### Short Description (under 500 characters — for Reddit app creation form)

```
GetPostFlow is a social media management platform for small businesses and agencies. We use the Reddit API to: (1) post content to subreddits on behalf of authorized user accounts, (2) monitor inbox messages and post comment threads for community management, and (3) retrieve basic analytics on submitted posts. All Reddit replies and comments are staged for human approval — we never auto-respond on Reddit under any circumstances.
```

### Extended Use Case Description (for elevated access requests)

```
GetPostFlow is a multi-platform AI-powered social media management SaaS for small and medium-sized businesses. The Reddit integration provides the following capabilities:

1. Content Submission (Post on Behalf)
Team members create Reddit posts (link posts, text posts) in the GetPostFlow content calendar and assign them to a connected Reddit user account. Posts go through GetPostFlow's approval workflow (internal review, optional client approval) before being submitted to Reddit via the API. Only explicitly approved posts are submitted. GetPostFlow uses the submit endpoint under the submit scope.

2. Inbox and Comment Monitoring
GetPostFlow polls the Reddit inbox and comment threads on submitted posts to surface replies, mentions, and modmail in the unified inbox. This is read-only aggregation. Team members review incoming messages in the GetPostFlow inbox.

3. Human-Gated Reply Drafting
When a team member wants to reply to a Reddit comment or message, they draft the reply in GetPostFlow. The draft goes through an approval step. Only after explicit human approval is the reply submitted to Reddit via the API. There is no automatic, policy-based auto-response mechanism for Reddit — the platform override is absolute.

4. Post Analytics
GetPostFlow retrieves basic metrics on submitted posts (score, upvotes, comment count) for analytics dashboards.

Reddit auto-response policy:
GetPostFlow's AI engagement engine supports configurable auto-response for other platforms (with strict category-level controls and moderation). Reddit is permanently excluded from auto-response at the platform level. This override cannot be disabled by any user or configuration. It is enforced in the product codebase, clearly communicated to users in the product UI, and stated in GetPostFlow's public marketing materials.
```

### Tagline (135 characters)
```
AI-assisted Reddit post scheduling and community inbox monitoring for SMBs — with mandatory human approval on every interaction.
```

### Reddit Platform Policy Compliance Table

| Requirement | GetPostFlow's Compliance |
|---|---|
| Do not spam or flood subreddits | Content publishing is manual and human-approved; rate-limited by GetPostFlow's scheduler. Users post to subreddits they have existing access to. |
| Do not automate voting | GetPostFlow does not request the `vote` scope and does not automate upvotes/downvotes. |
| Do not scrape or store large volumes of Reddit data | GetPostFlow retrieves only data directly related to connected accounts (inbox, post history, comment threads on own posts). No bulk subreddit scraping. |
| Do not automate comments/replies | **GetPostFlow never auto-comments or auto-replies on Reddit.** Every reply goes through human approval. This is enforced at the product level. |
| Respect rate limits | GetPostFlow's connector layer tracks and respects Reddit API rate limits. Polling is throttled to avoid quota violations. |
| User agent identification | GetPostFlow identifies itself with a compliant user agent string: `GetPostFlow/1.0 (by /u/[contact_reddit_username])` |

### Demo Video Script

**Target length:** 3–4 minutes
**Format:** Screen recording with voiceover. Use a real Reddit test account.

**[0:00–0:20] Introduction**
- State the app name, purpose, and what the video will demonstrate.
- Show: GetPostFlow dashboard.

**[0:20–0:55] Connecting a Reddit Account**
- Click "Connect Account" → select Reddit.
- Walk through the Reddit OAuth consent screen — narrate each scope and why it's needed.
- Show: Reddit account appearing in GetPostFlow's connected accounts list.

**[0:55–1:50] Scheduling and Submitting a Post**
- Create a text or link post in the content composer.
- Select the target subreddit.
- Set a scheduled date.
- Walk through the internal approval workflow.
- Approve → transitions to scheduled.
- Show: post submitted to the test subreddit at the scheduled time.

**[1:50–2:30] Unified Inbox — Comment Monitoring**
- Show a comment on the submitted Reddit post appearing in the GetPostFlow unified inbox.
- Draft a reply.
- **Explicitly demonstrate the approval step** — the reply does NOT send automatically.
- Approve the reply → it posts to Reddit.
- **Narrate: "GetPostFlow never auto-responds on Reddit. Every reply requires human approval."**

**[2:30–3:00] Analytics**
- Show the post's score and comment count appearing in the analytics panel.

**[3:00–3:20] Disconnect**
- Show disconnecting the Reddit account from Settings.

**[3:20–3:40] Closing**
- Recap each scope and its direct use.
- Re-state the no-auto-response policy explicitly on camera.

---

## Reddit Auto-Response Policy — Public Messaging

Per the GetPostFlow Architecture Plan v3, this policy must appear in three product surfaces:

1. **Features page / AI Engagement section:**
   > "All Reddit interactions require human approval. We never auto-respond on Reddit to protect your brand from community backlash."

2. **Pricing page near AI Engagement feature rows:**
   > Small note: Reddit always requires human approval — no exceptions.

3. **FAQ:**
   > **Q: Do you auto-reply on Reddit?**
   > A: No. Reddit is the one platform where automatic responses are permanently disabled, regardless of your plan or engagement policy settings. Every Reddit reply — even for simple FAQ-style messages — requires explicit human approval before it is sent. This is a core product decision to protect your brand's reputation in Reddit communities.

---

## TODOs Requiring User Action

1. **Register a Reddit account** for GetPostFlow to use as the contact in the user agent string (e.g., `/u/getpostflow_support`) — update the user agent template in the codebase with this username.
2. **Create the Reddit developer app** at https://www.reddit.com/prefs/apps using a logged-in Reddit account.
3. **Confirm the app type is "web app"** — not "installed app" or "script".
4. **Ensure the Privacy Policy at `https://getpostflow.vercel.app/privacy` explicitly states the Reddit auto-response policy** (no automated replies ever) and covers Reddit data handling.
5. **Create a Reddit test account** with a few posts and comments for use as reviewer credentials.
6. **Create a private test subreddit** or identify a low-traffic subreddit for test submissions during development.
7. **Apply the compliant user agent string** (`GetPostFlow/1.0 (by /u/USERNAME)`) to all Reddit API requests in the codebase before going live — non-compliant user agents are flagged.
8. **Implement rate limit header tracking** in the Reddit connector — Reddit's API headers contain remaining quota; GetPostFlow must respect these.
9. **Apply for elevated access** only after the integration is fully built and documented with real usage patterns.
10. **After Custom Domain cutover to `getpostflow.com`:** update the redirect URI in Reddit app settings (edit the app at https://www.reddit.com/prefs/apps) to add `https://getpostflow.com/api/oauth/reddit/callback`.
