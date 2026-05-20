# TikTok for Business / Marketing API Submission Packet
## GetPostFlow

> **Risk flag:** TikTok production scopes are the **highest approval risk** in this submission set (per GetPostFlow Architecture Plan v3). Submit this packet in Phase 0 before app code is finalized. Budget 4–8 weeks for approval.

---

## App Identity

| Field | Value |
|---|---|
| **App Name** | GetPostFlow |
| **Developer Account Type** | Business |
| **Products to Apply For** | Content Posting API, Login Kit, Research API (if analytics), Display API |
| **Primary Use Case** | Third-party social media management tool (SMB publishing and analytics) |

---

## Tagline

> AI-powered social media management for growing businesses — schedule, publish, and analyze TikTok content with client-safe approval workflows.

*(160 characters)*

---

## Long Description

*(Target: under 4,000 characters for TikTok's use-case description field)*

GetPostFlow is an AI-powered social media management platform built for small and medium-sized businesses and the agencies managing their brand presence. GetPostFlow enables teams to plan, generate, approve, schedule, and publish content to TikTok Business accounts while pulling in engagement analytics to measure performance — all within a structured, approval-first workflow.

**What GetPostFlow does with TikTok access:**

GetPostFlow integrates with TikTok's Content Posting API and Marketing API to provide the following capabilities for business end-users:

- **Video publishing:** Team members and authorized clients can schedule and publish video content to connected TikTok Business accounts. Every video passes through an internal team review and optionally a client approval step before any publish action is executed. GetPostFlow generates the content metadata (caption, hashtags), uploads media from secure URL-based or direct-upload flows as specified by TikTok's API, and handles publish confirmation.
- **Account analytics:** Retrieve account-level and video-level performance metrics (views, likes, comments, shares, follower growth) from the authorized TikTok account to populate analytics dashboards and client-ready reports.
- **Content scheduling:** Allow users to schedule TikTok posts at specific dates and times using GetPostFlow's scheduling engine, which queues and publishes content via the Content Posting API at the designated time.
- **OAuth account management:** End-users authenticate with their TikTok Business accounts via TikTok Login Kit. GetPostFlow stores the resulting access tokens encrypted at rest and refreshes them proactively before expiry.

GetPostFlow does **not** scrape TikTok, does not interact with TikTok's consumer app outside of authorized API channels, and does not auto-respond to TikTok comments without human approval.

**Who uses GetPostFlow:**
Small business owners, marketing teams, and social media agencies. All end-users authenticate their own TikTok Business accounts. GetPostFlow acts as an authorized third-party management platform on their behalf.

---

## Requested Scopes / Permissions

| Scope | Justification |
|---|---|
| `user.info.basic` | Required to retrieve the authenticated user's TikTok account identity (display name, avatar, open ID) so the correct account is shown in the GetPostFlow connected accounts list. |
| `video.publish` | Required to publish video content to the authenticated user's TikTok account via the Content Posting API. This is the core TikTok publishing capability of GetPostFlow. |
| `video.upload` | Required as part of the direct-post or inbox-post flow to upload video files before the publish step. Used in conjunction with `video.publish`. |
| `video.list` | Required to retrieve the list of published videos for the connected account, enabling analytics display and post-history tracking within GetPostFlow. |
| `user.insights` (or platform equivalent analytics scope) | Required to retrieve account-level and video-level analytics metrics (views, engagement rate, follower growth) for GetPostFlow's analytics dashboards and exported reports. |

> **TODO:** Verify exact scope names against the current TikTok for Developers scope reference at https://developers.tiktok.com — TikTok occasionally renames scopes between API versions. Update this list before submission.

---

## Redirect URIs

```
https://staging.getpostflow.com/api/oauth/tiktok/callback
```

> **TODO (replace before production submission):** Add the production URI:
> ```
> https://getpostflow.com/api/oauth/tiktok/callback
> ```

---

## Privacy Policy & Terms of Service

| Document | URL |
|---|---|
| Privacy Policy | `https://staging.getpostflow.com/privacy` |
| Terms of Service | `https://staging.getpostflow.com/terms` |

> **TODO:** Replace `staging.getpostflow.com` with the production domain. Privacy policy must explicitly cover TikTok Platform Data collection, storage, usage, and deletion procedures per TikTok Platform Policy requirements.

---

## Demo Video Script (Required)

**Target length:** 3–5 minutes
**Format:** Screen recording with voiceover. Use a real TikTok Business test account.

### Outline

**[0:00–0:20] Introduction**
- State the app name, category (social media management), and what will be demonstrated.
- Show: GetPostFlow dashboard.

**[0:20–1:00] Connecting a TikTok Business Account**
- Click "Connect Account" → select TikTok.
- Walk through TikTok Login Kit OAuth flow — narrate permissions being requested.
- Show: TikTok account appearing in the connected accounts list.

**[1:00–2:15] Scheduling and Publishing a TikTok Video**
- Upload a short test video via the content composer.
- Write a caption and add hashtags.
- Set a publish date and time.
- Submit the content through the internal approval step.
- Mark as approved → content transitions to scheduled state.
- Fast-forward or trigger an immediate publish to show the API call completing.
- Show: Video appearing on the test TikTok account.

**[2:15–2:50] Analytics**
- Navigate to the TikTok analytics panel.
- Show video views, likes, and account follower metrics populated from the analytics scope.

**[2:50–3:20] Token Management / Disconnect**
- Navigate to Settings → Connected Accounts.
- Show the disconnect flow — token revoked, account removed from list.

**[3:20–3:40] Closing**
- Recap each scope used, name it explicitly, and state its purpose.
- Confirm no consumer data is accessed outside authorized API channels.

---

## Screenshot List

1. **TikTok OAuth consent screen** — permissions list visible during Login Kit flow
2. **Connected TikTok account** — account listed in GetPostFlow's connected accounts panel
3. **Content composer** — video upload, caption, hashtags, schedule field
4. **Approval workflow** — content in "pending review" state
5. **Approved and scheduled state** — content in calendar view
6. **Publish confirmation** — success state after Content Posting API call
7. **Live TikTok post** — video appearing on the test account's profile
8. **Analytics dashboard** — video metrics and account analytics populated
9. **Disconnect account** — Settings page showing revocation option

---

## Test Account / Reviewer Credentials

> **TODO (user action required):**
> 1. Register as a TikTok for Developers developer at https://developers.tiktok.com
> 2. Create a TikTok Business developer app in the TikTok Developer Portal.
> 3. Set up a TikTok Business test account (sandbox or real account with minimal followers).
> 4. Provide TikTok App Review with:
>    - TikTok Business account credentials for the test account
>    - Login credentials for GetPostFlow staging environment
>    - URL to reach the staging environment
>    - Step-by-step instructions to reach the TikTok connect flow

---

## Expected Review Window & Tips

**Expected window:** 4–8 weeks for production Content Posting API access. TikTok's approval is among the strictest in the industry. Budget accordingly and submit in Phase 0.

### Tips to Avoid Common Rejections

1. **Register your business, not a personal developer account.** TikTok prioritizes business-verified developers for production publishing scopes.
2. **The demo video must show every scope being used.** TikTok reviewers verify scope-to-feature alignment closely.
3. **Use the Content Posting API (not the deprecated Share API).** TikTok deprecated the older Share API; any reference to it in docs or video will cause rejection.
4. **Caption the video clearly** — TikTok reviewers may not speak English as a first language; make use-case immediately obvious.
5. **Privacy policy must reference TikTok Platform Data specifically.** Generic policies fail.
6. **Apply for the minimum scopes first.** Requesting analytics scopes simultaneously with publishing scopes can trigger additional scrutiny. Consider phasing: publishing first, analytics in a follow-up review.
7. **Have a functioning staging environment** — reviewers test live, not from screenshots.
8. **Prepare a written use-case document** (separate from the video) that mirrors what the video shows. TikTok often asks for this as a supplemental document.
9. **Do not request audience data or DM scopes** unless implemented and shown — requesting unused scopes is an immediate rejection trigger.

---

## Common Rejection Reasons (TikTok-Specific)

- Business not verified or developer account not business-tier
- Scope requested but not demonstrated in the video
- App uses deprecated Share API references
- Privacy policy does not cover TikTok data
- Staging environment not functional at time of review
- App appears to be an analytics-only tool requesting publish scopes without clear publish demo

---
