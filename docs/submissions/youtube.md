# YouTube Data API v3 Submission Packet
## GetPostFlow — YouTube + YouTube Shorts

> **Note:** YouTube Shorts and long-form YouTube use the same YouTube Data API v3. There is no separate Shorts API; Shorts classification is determined by video duration (≤60 seconds) and metadata. This packet covers both.

---

## App Identity

| Field | Value |
|---|---|
| **App Name** | GetPostFlow |
| **OAuth Consent Screen Name** | GetPostFlow |
| **Google Cloud Project Name** | getpostflow-production |
| **API Enabled** | YouTube Data API v3 |
| **User Type** | External |
| **App Category** | Social media management / content publishing tool |

---

## Tagline

> Schedule, publish, and analyze YouTube and YouTube Shorts content — with AI-assisted creation and client approval workflows built in.

*(155 characters)*

---

## Long Description

*(Google OAuth consent screen app description + verification submission notes — under 10,000 characters)*

GetPostFlow is an AI-powered social media management platform for small and medium-sized businesses and the agencies serving them. GetPostFlow connects to YouTube via the YouTube Data API v3 to enable content scheduling, publishing, analytics retrieval, and comment management for YouTube channels owned by GetPostFlow's end-users.

**What GetPostFlow does with YouTube access:**

**Video Publishing (including YouTube Shorts):**
GetPostFlow allows teams to upload and publish videos to connected YouTube channels on behalf of authorized users. Videos are uploaded using the resumable upload protocol (`videos.insert` with `uploadType=resumable`) to handle large files reliably. Metadata including title, description, tags, category, and privacy status is set at upload time. YouTube Shorts are published using the same API; video duration and the `#Shorts` tag in the description determine classification by YouTube.

**Content Scheduling:**
Videos are scheduled by setting `status.publishAt` to a future timestamp with `status.privacyStatus` set to `private` at upload, then automatically transitioning to public via the scheduling engine. GetPostFlow's queue-based worker handles timing and retry.

**Comment Management:**
GetPostFlow retrieves comments from YouTube videos published to connected channels (`commentThreads.list`) to surface them in the unified inbox. Team members can draft replies and submit them for human review before posting (`comments.insert`, `commentThreads.insert`).

**Analytics:**
GetPostFlow retrieves channel and video analytics using the YouTube Analytics API (`reports.query`) to populate performance dashboards — including views, watch time, subscribers gained, impressions, and click-through rate.

**Who uses GetPostFlow:**
Small businesses, creators operating as a business, and marketing agencies managing client YouTube channels. Each user authenticates their own Google account and YouTube channel through the standard OAuth 2.0 consent flow.

---

## Requested Scopes

| Scope | Justification |
|---|---|
| `https://www.googleapis.com/auth/youtube.upload` | Required to upload video content (including YouTube Shorts) to the authenticated user's YouTube channel. This is the core YouTube publishing capability. |
| `https://www.googleapis.com/auth/youtube` | Required for broader channel management operations including updating video metadata post-upload, managing video status (public/private/scheduled), and reading channel details needed to associate the connected account with the correct workspace. |
| `https://www.googleapis.com/auth/youtube.readonly` | Required to read channel information, video lists, and subscription data for display in the connected accounts panel and content history views. |
| `https://www.googleapis.com/auth/youtube.force-ssl` | Required by Google as a prerequisite for comment management operations (reading and posting comments via `commentThreads` endpoints). |
| `https://www.googleapis.com/auth/yt-analytics.readonly` | Required to retrieve channel and video analytics metrics (views, watch time, subscribers, CTR) from the YouTube Analytics API to populate GetPostFlow's performance dashboards and reports. |

> **Note on quota:** The YouTube Data API v3 default quota is **10,000 units/day**. At scale, GetPostFlow will require a quota increase. Submit a quota increase request to Google Cloud via the API Console once initial approval is granted. Document expected usage patterns (uploads/day, analytics calls/day) before submitting the increase request.

---

## Redirect URIs

```
https://staging.getpostflow.com/api/oauth/youtube/callback
```

> **TODO (replace before production submission):** Add the production URI:
> ```
> https://getpostflow.com/api/oauth/youtube/callback
> ```
> Also register the redirect URI in the Google Cloud Console under **APIs & Services → Credentials → OAuth 2.0 Client IDs**.

---

## Privacy Policy & Terms of Service

| Document | URL |
|---|---|
| Privacy Policy | `https://staging.getpostflow.com/privacy` |
| Terms of Service | `https://staging.getpostflow.com/terms` |

> **TODO:** Replace `staging.getpostflow.com` with the production domain. Google's OAuth verification requires the privacy policy to be:
> - Publicly accessible (no login required)
> - Explicitly covering Google user data collection, use, and deletion
> - Compliant with Google API Services User Data Policy

---

## Demo Video Script (Required for Sensitive Scopes)

**Target length:** 3–5 minutes
**Format:** Screen recording with voiceover. Use a real Google/YouTube test account.

### Outline

**[0:00–0:20] Introduction**
- State: "This is GetPostFlow, demonstrating YouTube Data API v3 integration."
- Show: GetPostFlow dashboard, logged in as a test user.

**[0:20–1:00] Connecting a YouTube Channel**
- Click "Connect Account" → select YouTube.
- Walk through Google OAuth consent screen — narrate each scope being requested and why.
- Show: YouTube channel appearing in GetPostFlow's connected accounts list.

**[1:00–2:00] Uploading and Publishing a Video**
- Create a new content item, attach a test video file.
- Set title, description, tags, category, scheduled date.
- Submit through approval workflow → approve → transitions to scheduled.
- Show: upload progress bar (resumable upload) → video published to test YouTube channel.
- Narrate: "`youtube.upload` scope is used here."

**[2:00–2:30] YouTube Shorts**
- Repeat with a short (≤60 second) video and `#Shorts` in description.
- Show: video classified as a Short on the channel.

**[2:30–3:00] Comment Inbox**
- Show a comment on the test video appearing in the GetPostFlow unified inbox.
- Draft a reply, approve it, post it.
- Show: reply appearing on YouTube.
- Narrate: "`youtube.force-ssl` scope is required for comment management."

**[3:00–3:30] Analytics**
- Navigate to the YouTube analytics panel.
- Show views, watch time, impressions metrics.
- Narrate: "`yt-analytics.readonly` scope is used here."

**[3:30–4:00] Disconnect**
- Navigate to Settings → Connected Accounts, show disconnect and token revocation.

---

## Screenshot List

1. **Google OAuth consent screen** — scopes visible during authorization
2. **Connected YouTube channel** — channel listed in GetPostFlow's connected accounts
3. **Video upload composer** — title, description, tags, scheduled date fields
4. **Approval workflow** — video content in "pending review" state
5. **Upload progress** — resumable upload progress indicator
6. **Published video** — video live on test YouTube channel
7. **YouTube Shorts post** — short video published and classified as Short
8. **Comment in unified inbox** — YouTube comment appearing in GetPostFlow
9. **Reply approval** — reply draft with approve/edit buttons
10. **Analytics dashboard** — YouTube metrics (views, watch time, CTR)
11. **Disconnect account** — Settings showing revocation option

---

## Test Account / Reviewer Credentials

> **TODO (user action required):**
> 1. Create a Google test account (non-personal) dedicated to OAuth verification.
> 2. Create a test YouTube channel on that account with a few published videos.
> 3. Connect the test channel to GetPostFlow staging.
> 4. Provide Google verification team with:
>    - Google account email and password (or use Google's test user flow)
>    - GetPostFlow staging login credentials
>    - Step-by-step instructions to reach the YouTube connect flow
>    - URL of the staging environment

---

## Expected Review Window & Tips

**Expected window:** Google's OAuth app verification (for sensitive/restricted scopes) typically takes **3–5 business days** for initial review; security assessment required for restricted scopes (`youtube` write scope) can take **4–6 weeks** and may require a third-party security assessment (CASA Tier 2).

### Tips to Avoid Common Rejections

1. **Branding consistency:** App name, logo, and domain in the OAuth consent screen must match your production website exactly.
2. **Show every scope in the demo video** — reviewers reject apps that request scopes not demonstrated.
3. **`youtube` (read-write) scope triggers extended review.** If publishing is not ready, start with `youtube.readonly` and `youtube.upload` for an initial approval, then add write scope in a later review round.
4. **Privacy policy must reference Google API data specifically** and comply with the Google API Services User Data Policy.
5. **Quota increase:** Submit quota increase request via Google Cloud Console **separately** from the OAuth verification. These are independent processes.
6. **Use a verified domain** in Google Search Console and link it to your Cloud project before submitting for verification.
7. **Do not request `yt-analytics` restricted scope** (`yt-analytics`) without demonstrating analytics in the video. Use `yt-analytics.readonly` for read-only analytics access.
8. **Resumable upload must work end-to-end in the demo.** A stalled or failed upload in the screencast is a rejection trigger.

---

## Common Rejection Reasons (Google/YouTube-Specific)

- OAuth consent screen branding inconsistent with production domain
- Scope requested but not shown in demo video
- Privacy policy not publicly accessible or missing Google data section
- App description too vague ("manage social media" without specifics)
- Quota limit too low for intended usage — plan quota increase request in parallel
- Domain not verified in Google Search Console

---
