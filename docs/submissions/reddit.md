# Reddit API Submission Packet
## GetPostFlow

> **CRITICAL PRODUCT POLICY — REDDIT AUTO-RESPONSE IS HARD-BLOCKED:**
> Per GetPostFlow Architecture Plan v3, **all Reddit interactions require human approval in every product tier and every engagement category — without exception.** Even when the global auto-engagement policy would permit auto-response for a given category (e.g., FAQ replies, simple positive engagement), the Reddit platform override **always** forces suggest-and-approve mode on Reddit. GetPostFlow **never** auto-responds on Reddit. This is a non-negotiable product policy designed to protect clients from community backlash. This policy must be stated clearly in the submission, the privacy policy, and the product UI.

---

## App Identity

| Field | Value |
|---|---|
| **App Name** | getpostflow |
| **App Type** | Web app (script type if needed for initial testing) |
| **About URL** | `https://staging.getpostflow.com` |
| **API Access Level** | Standard (apply for elevated access if post volume requires it) |

---

## Tagline

> AI-assisted Reddit post scheduling and community inbox monitoring for SMBs — with mandatory human approval on every interaction.

*(135 characters)*

---

## Long Description

*(Reddit API application "description" field — keep under 500 characters; supplement with a separate use-case document for elevated access requests)*

GetPostFlow is a social media management platform for small businesses and agencies. We use the Reddit API to: (1) post content to subreddits on behalf of authorized user accounts, (2) monitor inbox messages and post comment threads for community management, and (3) retrieve basic analytics on submitted posts. **All Reddit replies and comments are staged for human approval — we never auto-respond on Reddit under any circumstances.**

---

## Extended Use Case Description

*(For elevated access requests or support escalations — full detail)*

GetPostFlow is a multi-platform AI-powered social media management SaaS for small and medium-sized businesses. The Reddit integration provides the following capabilities:

**1. Content Submission (Post on Behalf)**
Team members create Reddit posts (link posts, text posts) in the GetPostFlow content calendar and assign them to a connected Reddit user account. Posts go through GetPostFlow's approval workflow (internal review, optional client approval) before being submitted to Reddit via the API. Only explicitly approved posts are submitted. GetPostFlow uses the `submit` endpoint under the `submit` scope.

**2. Inbox and Comment Monitoring**
GetPostFlow polls the Reddit inbox and comment threads on submitted posts to surface replies, mentions, and modmail in the unified inbox. This is read-only aggregation. Team members review incoming messages in the GetPostFlow inbox.

**3. Human-Gated Reply Drafting**
When a team member wants to reply to a Reddit comment or message, they draft the reply in GetPostFlow. The draft goes through an approval step. **Only after explicit human approval is the reply submitted to Reddit via the API.** There is no automatic, policy-based auto-response mechanism for Reddit — the platform override is absolute.

**4. Post Analytics**
GetPostFlow retrieves basic metrics on submitted posts (score, upvotes, comment count) for analytics dashboards.

**Reddit auto-response policy:**
GetPostFlow's AI engagement engine supports configurable auto-response for other platforms (with strict category-level controls and moderation). **Reddit is permanently excluded from auto-response at the platform level.** This override cannot be disabled by any user or configuration. It is enforced in the product codebase, clearly communicated to users in the product UI, and stated in GetPostFlow's public marketing materials.

---

## Requested Scopes / Permissions

| Scope | Justification |
|---|---|
| `identity` | Required to verify the authenticated Reddit user's identity (username) to associate the Reddit account with the correct GetPostFlow workspace. |
| `submit` | Required to submit link and text posts to subreddits on behalf of the authenticated user. This is the core Reddit publishing capability. Only explicitly approved content is submitted. |
| `read` | Required to read posts and comments on subreddits and the authenticated user's profile to surface content history and monitor post-level analytics (score, comment count). |
| `privatemessages` | Required to read Reddit inbox messages (replies, mentions) for the unified community inbox and to send moderation replies that have received human approval. |
| `history` | Required to retrieve the post history of the connected Reddit account for analytics and content history display within GetPostFlow. |

> **Note on scope minimalism:** GetPostFlow does not request moderator-level scopes (`modconfig`, `modposts`, `modlog`) and does not request access to vote or save actions, consistent with the principle of minimum necessary access.

---

## Redirect URIs

```
https://staging.getpostflow.com/api/oauth/reddit/callback
```

> **TODO (replace before production submission):** Add the production URI:
> ```
> https://getpostflow.com/api/oauth/reddit/callback
> ```

---

## Privacy Policy & Terms of Service

| Document | URL |
|---|---|
| Privacy Policy | `https://staging.getpostflow.com/privacy` |
| Terms of Service | `https://staging.getpostflow.com/terms` |

> **TODO:** Replace `staging.getpostflow.com` with the production domain. The privacy policy must explicitly cover Reddit platform data collection and usage. Include a clear statement about the Reddit auto-response prohibition.

---

## Reddit Platform Policy Compliance Notes

The following items confirm GetPostFlow's compliance with Reddit's API Terms and Developer Terms:

| Requirement | GetPostFlow's Compliance |
|---|---|
| Do not spam or flood subreddits | Content publishing is manual and human-approved; rate-limited by GetPostFlow's scheduler. Users post to subreddits they have existing access to. |
| Do not automate voting | GetPostFlow does not request the `vote` scope and does not automate upvotes/downvotes. |
| Do not scrape or store large volumes of Reddit data | GetPostFlow retrieves only data directly related to connected accounts (inbox, post history, comment threads on own posts). No bulk subreddit scraping. |
| Do not automate comments/replies | **GetPostFlow never auto-comments or auto-replies on Reddit.** Every reply goes through human approval. This is enforced at the product level. |
| Respect rate limits | GetPostFlow's connector layer tracks and respects Reddit API rate limits. Polling is throttled to avoid quota violations. |
| User agent identification | GetPostFlow identifies itself with a compliant user agent string: `GetPostFlow/1.0 (by /u/[contact_reddit_username])` |

> **TODO:** Register a Reddit account for GetPostFlow to use as the contact in the user agent string and as the application owner. Update the user agent template above with the actual username.

---

## Demo Video Script

**Target length:** 3–4 minutes  
**Format:** Screen recording with voiceover. Use a real Reddit test account.

### Outline

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

## Screenshot List

1. **Reddit OAuth consent screen** — scopes visible during authorization
2. **Connected Reddit account** — account in GetPostFlow's accounts panel
3. **Content composer** — post type, subreddit, text/link, scheduled date
4. **Approval workflow** — post in "pending review" state
5. **Submitted Reddit post** — live on test subreddit
6. **Reddit comment in unified inbox** — comment surfaced in GetPostFlow
7. **Reply draft with mandatory approval gate** — approve/edit buttons, no auto-send indicator
8. **Reply sent** — reply visible on the Reddit thread
9. **Analytics panel** — post score and comment count
10. **Disconnect account** — Settings page with revocation option

---

## Test Account / Reviewer Credentials

> **TODO (user action required):**
> 1. Register a Reddit developer application at https://www.reddit.com/prefs/apps
> 2. Create a Reddit test account with a few post/comment history entries.
> 3. Connect the test account to GetPostFlow staging.
> 4. Create a test subreddit (private) or use a low-traffic subreddit for test submissions.
> 5. Provide Reddit API review (if applicable for elevated access) with:
>    - Reddit test account credentials
>    - GetPostFlow staging login credentials
>    - URL of the staging environment

---

## Expected Review Window & Tips

**Expected window:** Standard Reddit API access is granted automatically on app creation (OAuth app type: "web app"). Elevated access (higher rate limits) requires a support request to Reddit — typically **1–3 weeks**.

### Tips to Avoid Common Rejections / Elevated Access Denial

1. **Standard access is sufficient for initial development.** Apply for elevated access once you have a working integration and real usage patterns documented.
2. **Your Reddit user agent must be compliant.** Non-standard or missing user agents are flagged. Format: `platform:appname:version (by /u/username)`.
3. **No vote automation.** Never request the `vote` scope and ensure no voting logic exists in the codebase.
4. **Do not bulk-scrape subreddits.** Reddit's elevated access review looks at how data is used. Showing only account-level data access (inbox, own post history) is much stronger than subreddit-wide scraping.
5. **Clearly document the human-approval requirement** for replies in your elevated access application. Reddit is sensitive to automation tools and the manual-approval gate is a significant trust signal.
6. **Rate limit compliance.** Show in your application that you track and respect Reddit's rate limit headers.
7. **Use the `read` scope conservatively.** Do not retrieve more subreddit data than needed to service connected user accounts.

---

## Common Rejection Reasons (Reddit-Specific)

- Automated posting or replying without human involvement
- Non-compliant user agent string
- Requesting vote or mod scopes without clear justification
- Bulk subreddit data scraping patterns detected
- No human review gate demonstrated for replies

---

## Reddit Auto-Response Policy — Public Messaging

Per the plan, this policy must appear in three product surfaces:

1. **Features page / AI Engagement section:**
   > "All Reddit interactions require human approval. We never auto-respond on Reddit to protect your brand from community backlash."

2. **Pricing page near AI Engagement feature rows:**
   > Small note: Reddit always requires human approval — no exceptions.

3. **FAQ:**
   > **Q: Do you auto-reply on Reddit?**
   > A: No. Reddit is the one platform where automatic responses are permanently disabled, regardless of your plan or engagement policy settings. Every Reddit reply — even for simple FAQ-style messages — requires explicit human approval before it is sent. This is a core product decision to protect your brand's reputation in Reddit communities.

---
