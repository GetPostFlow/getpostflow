# Meta Developer App Submission Packet
## GetPostFlow — Facebook + Instagram (Single Meta App, Multiple Products)

---

## App Identity

| Field | Value |
|---|---|
| **App Name** | GetPostFlow |
| **App Type** | Business |
| **Products to Add** | Facebook Login for Business, Instagram Graph API, Webhooks |
| **Business Use Case** | Social media management platform for SMBs |

---

## Tagline

> AI-powered social media management for growing businesses — publishing, inbox, analytics, and client approvals in one platform.

*(160 characters — within Meta's display limit)*

---

## Long Description

*(Max ~4,000 characters for App Review submission notes — well under limit)*

GetPostFlow is a multi-platform AI social media management SaaS built for small and medium-sized businesses and the agencies that serve them. It provides a unified dashboard for content creation, scheduling, publishing, community inbox management, and performance analytics across Facebook and Instagram alongside seven other supported platforms.

**What GetPostFlow does with Facebook and Instagram access:**

GetPostFlow connects to Facebook Pages and Instagram Business/Creator accounts on behalf of end-user businesses. Once connected, the platform enables:

- **Content publishing:** Schedule and publish posts, photos, videos, carousels, and Reels to Facebook Pages and Instagram Business accounts. Content is drafted and approved through a structured internal and client approval workflow before any publish action is taken.
- **Media analytics:** Pull post-level and page/account-level insights (reach, impressions, engagement, follower growth) to populate performance dashboards and client-ready reports.
- **Unified inbox:** Aggregate comments, messages (where permitted), and mentions from Facebook Pages and Instagram into a normalized inbox for team review, response drafting, and AI-assisted engagement suggestions. All responses go through human approval before sending.
- **Client approval workflows:** Let end-user clients review and approve scheduled content from a dedicated client portal. Client approvals automatically advance content to the scheduled state.
- **Webhook event handling:** Subscribe to real-time events for Page feeds, Instagram media, and messaging to keep inbox and analytics data current.

GetPostFlow does **not** store user passwords. All access is OAuth-based, scoped to the minimum permissions required for each feature, and tokens are encrypted at rest.

**Who uses GetPostFlow:**
Small business owners, marketing managers, and social media agencies managing one or multiple brand accounts. Users log into GetPostFlow directly; they authorize their Facebook and Instagram connections through standard Meta OAuth flows.

---

## Requested Permissions & Scopes

### Facebook Permissions

| Permission | Justification |
|---|---|
| `pages_show_list` | Required to enumerate the Facebook Pages the user manages so they can connect a Page to their GetPostFlow workspace. Without this, users cannot select which Page to manage. |
| `pages_read_engagement` | Required to read Page posts, comments, and reactions for unified inbox aggregation and analytics reporting. |
| `pages_manage_posts` | Required to create, schedule, and publish posts to managed Facebook Pages on behalf of users. This is the core publishing capability. |
| `pages_manage_engagement` | Required to post replies to comments on Page posts when a team member approves a suggested response through the inbox. |
| `pages_read_user_content` | Required to read visitor-posted content (comments, reviews) on managed Pages for inbox monitoring. |
| `pages_manage_metadata` | Required to subscribe Page webhooks so GetPostFlow receives real-time feed and messaging events. |
| `read_insights` | Required to retrieve Page-level insights (reach, impressions, engagement metrics) for analytics dashboards and scheduled reports. |
| `business_management` | Required to read Business Manager metadata to correctly associate Pages and Instagram accounts with the right business workspace in GetPostFlow. |
| `instagram_basic` | Required as a baseline to access the connected Instagram Business account linked to the authorized Facebook Page. |
| `instagram_content_publish` | Required to publish photos, videos, Reels, carousels, and Stories to the connected Instagram Business/Creator account. This is the core Instagram publishing capability. |
| `instagram_manage_comments` | Required to read and reply to comments on Instagram media, enabling the unified inbox to surface and manage Instagram engagement. |
| `instagram_manage_insights` | Required to retrieve media-level and account-level insights (reach, impressions, engagement, saves, follower count) for analytics and reporting. |
| `instagram_manage_messages` | Required to read and reply to Instagram Direct Messages in the unified inbox where the user has a Business account with DM access enabled. |

### Token Handling

- Access tokens are stored encrypted at rest using AES-256.
- Long-lived page tokens are obtained and refreshed proactively before expiry.
- Users can disconnect their Meta accounts at any time from the GetPostFlow settings page, which immediately revokes stored tokens.

---

## Redirect URIs

```
https://getpostflow.vercel.app/api/oauth/meta/callback
```

---

## Privacy Policy & Terms of Service

| Document | URL |
|---|---|
| Privacy Policy | `https://getpostflow.vercel.app/privacy` |
| Terms of Service | `https://getpostflow.vercel.app/terms` |

---

## Demo Video Script (Required for Advanced Permissions)

**Target length:** 3–5 minutes
**Format:** Screen recording with voiceover. Show a real test Facebook Page and test Instagram Business account.

### Outline

**[0:00–0:20] Introduction**
- State: "This is GetPostFlow, a social media management platform. I'll demonstrate how we use Facebook and Instagram permissions."
- Show: GetPostFlow dashboard, logged in as a demo business user.

**[0:20–1:00] Connecting a Facebook Page and Instagram Account**
- Click "Connect Account" → choose Facebook.
- Walk through the Meta OAuth consent screen — narrate each permission being requested and why.
- Show: Page and Instagram account appearing in GetPostFlow's connected accounts list.

**[1:00–2:00] Creating and Publishing Content**
- Create a new post in the content calendar.
- Write caption, attach an image.
- Set schedule.
- Submit for internal review → mark approved → content transitions to scheduled.
- Show: Post appearing as published on the Facebook Page and Instagram profile.

**[2:00–2:45] Unified Inbox — Comments and Messages**
- Show an incoming comment on the published Facebook post appearing in the GetPostFlow inbox.
- AI suggests a response — show the approval step before sending.
- Approve and send the reply — show it appearing on the Facebook post.

**[2:45–3:30] Analytics**
- Navigate to the Analytics dashboard.
- Show post-level insights (reach, impressions, engagement) populated from `read_insights` and `instagram_manage_insights`.
- Show audience growth chart.

**[3:30–4:00] Token Revocation / Disconnect**
- Navigate to Settings → Connected Accounts.
- Show disconnecting the Facebook/Instagram account — confirm token is removed.

**[4:00–4:15] Closing**
- Recap permissions used and their purpose.
- State: "GetPostFlow requests only the permissions necessary for these features."

---

## Screenshot List

Capture the following screens from a test account:

1. **OAuth consent screen** — showing permission request list during Meta Login flow
2. **Connected accounts list** — Facebook Page and Instagram account listed after authorization
3. **Content composer** — creating a post with image, caption, platform selectors
4. **Content calendar** — scheduled post visible before publish
5. **Published post confirmation** — post live on test Facebook Page
6. **Unified inbox** — Facebook comment appearing in the inbox
7. **AI response suggestion** with approve/edit buttons visible
8. **Reply sent confirmation** — response visible on the Facebook post
9. **Analytics dashboard** — Page insights (reach, impressions, engagement)
10. **Instagram insights panel** — media insights from `instagram_manage_insights`
11. **Disconnect account** — Settings page showing token revocation option

> All screenshots must use a genuine test Page/account, not mockups or placeholder images.

---

## Test Account / Reviewer Credentials

> **TODO (user action required):**
> 1. Create a dedicated Meta Developer test user (via your Meta Developer app → Roles → Test Users).
> 2. Create a test Facebook Page owned by the test user.
> 3. Link a test Instagram Business account to the test Page.
> 4. Provide Meta App Review with:
>    - Email / login for the test user
>    - Any 2FA codes or instructions
>    - URL of the GetPostFlow staging environment
>    - Login credentials for the GetPostFlow staging account that has the test Page connected

---

## Expected Review Window & Tips

**Expected window:** 2–5 business days for standard permissions; 1–3 weeks for advanced permissions (especially `pages_manage_engagement`, `instagram_manage_messages`).

### Tips to Avoid Common Rejections

1. **Show every permission being actively used in the video.** Meta rejects apps that request permissions not visibly exercised.
2. **Use a real, populated Page** — not a brand new empty test Page. Have posts and comments on it before filming.
3. **Narrate the consent screen** — call out each permission by name as it appears.
4. **Privacy policy must explicitly mention Meta Platform Data.** Generic privacy policies are rejected. Add a section titled "Social Platform Data" covering Facebook and Instagram data handling.
5. **Do not request `instagram_manage_messages` unless DM inbox is fully implemented and shown.** Request it in a separate review round if needed.
6. **Business Verification** — complete Meta Business Verification before submitting for advanced permissions. Unverified businesses face higher rejection rates.
7. **App description must match your video** — reviewers cross-check the written description against the demo.
8. **Avoid generic language** like "to improve user experience." Every justification must state the specific feature that requires the permission.

---

## Common Rejection Reasons (Meta-Specific)

- Permission not demonstrated in the screencast
- Privacy policy URL returns 404 or does not cover Meta Platform Data
- App not in Live mode at time of review (switch from Development to Live first)
- Missing Business Verification
- Requesting `business_management` without showing a business use case
- Test account credentials not provided or expired during review

---
