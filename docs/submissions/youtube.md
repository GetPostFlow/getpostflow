# YouTube / Google — Submission Playbook
<!-- Source: https://console.cloud.google.com -->

> **Note:** YouTube Shorts and long-form YouTube use the same YouTube Data API v3. There is no separate Shorts API; Shorts classification is determined by video duration (≤60 seconds) and metadata. This playbook covers both.

---

## Console URL

https://console.cloud.google.com

---

## Prerequisites

- A Google account for the GetPostFlow developer/organization
- App logo prepared: 1024×1024 px PNG
- Privacy Policy live at `https://getpostflow.vercel.app/privacy` — must explicitly reference Google API data and comply with Google API Services User Data Policy
- Terms of Service live at `https://getpostflow.vercel.app/terms`
- Domain `vercel.app` verified (use `getpostflow.vercel.app` as the authorized domain)
- A Google account with a test YouTube channel (several published videos recommended before filming demo)
- GetPostFlow staging environment functional and accessible

---

## Step-by-Step

### Step 1: Create the App / Account Setup

1. Navigate to **https://console.cloud.google.com**.
2. Sign in with the Google account that will own the GetPostFlow project.
3. In the top navigation bar, click the project selector dropdown (shows the current project name or "Select a project").
4. Click **"New Project"** (<!-- Verify in console: button labeled approximately "New Project" in the project selector modal -->).
5. Fill in:
   - **Project name:** `getpostflow-production`
   - **Organization:** select your organization if applicable, or leave as "No organization"
   - **Location:** leave as default
6. Click **"Create"**.
7. After creation, ensure the new project is selected in the project selector dropdown.

---

### Step 2: Enable YouTube Data API v3

1. In the left sidebar, navigate to **"APIs & Services"** → **"Library"**.
2. In the search box, type `YouTube Data API v3`.
3. Click the **"YouTube Data API v3"** result.
4. Click **"Enable"**.
5. Wait for the API to enable — the page will reload and show the API dashboard.

---

### Step 3: Configure OAuth Consent Screen

1. In the left sidebar, navigate to **"APIs & Services"** → **"OAuth consent screen"**.
   - Alternatively: navigate via **"Google Auth platform"** → **"Branding"** if the updated Google Auth Platform UI is shown (<!-- Verify in console: the navigation path may be labeled "Google Auth Platform" in the newer console UI -->).
2. Click **"Get Started"** if this is the first time configuring the consent screen (<!-- Verify in console: button labeled approximately "Get Started" or "Configure" on the OAuth consent screen page -->).
3. Fill in the required fields:
   - **App name:** `GetPostFlow`
   - **User support email:** your developer account email
   - **App logo:** upload the 1024×1024 px PNG
4. Under **"Authorized domains"**, click **"Add domain"** → add `vercel.app`.
5. Under **"Developer contact information"**, add your developer email address.
6. Click **"Save and Continue"** (<!-- Verify in console: button labeled approximately "Save and Continue" or "Next" -->).
7. On the **Audience** step:
   - Select **"External"** (allows any Google user to authorize — required for a public SaaS app).
   - Click **"Save and Continue"**.

---

### Step 4: Add Scopes

1. On the **Data Access** step (or navigate to **OAuth consent screen** → **"Data Access"** → **"Add or Remove Scopes"**):
2. Click **"Add or Remove Scopes"** (<!-- Verify in console: button labeled approximately "Add or Remove Scopes" -->).
3. In the scopes search/selection panel, add each of the following scopes:

| Scope URI | Why GetPostFlow Needs It | Google Classification |
|---|---|---|
| `https://www.googleapis.com/auth/youtube.upload` | Required to upload video content (including YouTube Shorts) to the authenticated user's YouTube channel. Core YouTube publishing capability. | Restricted |
| `https://www.googleapis.com/auth/youtube` | Required for broader channel management — updating video metadata post-upload, managing video status (public/private/scheduled), and reading channel details. | Restricted |
| `https://www.googleapis.com/auth/youtube.readonly` | Required to read channel information, video lists, and subscription data for the connected accounts panel and content history views. | Sensitive |
| `https://www.googleapis.com/auth/youtube.force-ssl` | Required by Google as a prerequisite for comment management operations (reading and posting comments via `commentThreads` endpoints). | Sensitive |
| `https://www.googleapis.com/auth/yt-analytics.readonly` | Required to retrieve channel and video analytics metrics (views, watch time, subscribers, CTR) from the YouTube Analytics API for performance dashboards. | Sensitive |

4. Click **"Update"** after selecting all scopes.
5. Click **"Save and Continue"**.

> **Note on restricted scopes:** The `youtube` and `youtube.upload` scopes are classified as **Restricted** by Google. This triggers additional verification including a potential CASA Tier 2 security assessment. Budget 4–6 weeks for the full verification cycle for these scopes.

---

### Step 5: Create OAuth 2.0 Credentials

1. In the left sidebar, navigate to **"APIs & Services"** → **"Credentials"**.
2. Click **"Create Credentials"** → select **"OAuth client ID"**.
3. Fill in:
   - **Application type:** `Web application`
   - **Name:** `GetPostFlow Web Client`
4. Under **"Authorized redirect URIs"**, click **"Add URI"** → paste:
   ```
   https://getpostflow.vercel.app/api/oauth/youtube/callback
   ```
5. Click **"Create"**.
6. A dialog appears showing your **Client ID** and **Client Secret** — copy and save both securely. This is the only time the Client Secret is shown in full.

> Also register this redirect URI in the **OAuth consent screen** → **Authorized domains** section if it is not already covered by the `vercel.app` authorized domain.

---

### Step 6: Submit for Verification

1. Navigate to **"APIs & Services"** → **"OAuth consent screen"**.
2. If the app is in "Testing" mode (limited to 100 test users), click **"Prepare for Verification"** or **"Submit for Verification"** (<!-- Verify in console: button labeled approximately "Prepare for Verification", "Publish App", or "Submit for Verification" -->).
3. Complete the verification submission form:
   - Provide justifications for each sensitive/restricted scope — use the justifications from the Paste-Ready Content Block below
   - Provide a link to the demo video (upload to YouTube unlisted or Vimeo, then paste the URL)
   - Provide the Privacy Policy URL: `https://getpostflow.vercel.app/privacy`
   - Provide the homepage URL: `https://getpostflow.vercel.app`
4. Click **"Submit"**.

**Questionnaire answers:** See scope justifications in the Paste-Ready Content Block.

**Demo video requirements:**
- Length: 3–5 minutes
- Format: screen recording with voiceover
- Must use a real Google/YouTube test account
- Must demonstrate every scope being actively used
- Upload as unlisted YouTube or Vimeo video and paste the URL
- See Demo Video Script in Paste-Ready Content Block

**Screenshot list:**
1. Google OAuth consent screen — scopes visible during authorization
2. Connected YouTube channel — channel listed in GetPostFlow's connected accounts
3. Video upload composer — title, description, tags, scheduled date fields
4. Approval workflow — video content in "pending review" state
5. Upload progress — resumable upload progress indicator
6. Published video — video live on test YouTube channel
7. YouTube Shorts post — short video published and classified as Short
8. Comment in unified inbox — YouTube comment appearing in GetPostFlow
9. Reply approval — reply draft with approve/edit buttons
10. Analytics dashboard — YouTube metrics (views, watch time, CTR)
11. Disconnect account — Settings showing revocation option

**Test credentials:**

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

### Step 7: Request Quota Increase (Separate Process)

> This step is **independent** of OAuth verification — it can be done in parallel or after approval.

1. Navigate to **"APIs & Services"** → **"Quotas & System Limits"** → find **YouTube Data API v3**.
2. Click on the quota item for **"Queries per day"** (default: 10,000 units/day).
3. Click **"Edit Quotas"** or request an increase via the form (<!-- Verify in console: button labeled approximately "Edit Quotas" or "Request increase" →).
4. Fill in:
   - Expected queries per day
   - Use case description
   - Justification for increased quota

> **Note:** The YouTube Data API v3 default quota is 10,000 units/day. At scale with multiple users uploading videos and pulling analytics, GetPostFlow will need a quota increase. Document expected usage patterns (uploads/day, analytics calls/day, comment fetches/day) before submitting.

---

### Step 8: Wait for Approval

- **Basic review (non-sensitive scopes):** 3–5 business days.
- **Sensitive/restricted scopes (`youtube`, `youtube.upload`):** 4–6 weeks; may require a third-party CASA Tier 2 security assessment.
- **Where to track status:** APIs & Services → OAuth consent screen — the page shows the current verification status and any action items.

**Common rejection reasons:**
- OAuth consent screen branding inconsistent with production domain
- Scope requested but not shown in demo video
- Privacy policy not publicly accessible or missing Google API data section
- App description too vague ("manage social media" without specifics)
- Domain not verified in Google Search Console
- Resumable upload fails or stalls in the demo screencast

**If rejected:**
- Google's verification team sends a detailed email with rejection reason.
- Address each specific issue raised.
- Resubmit via the OAuth consent screen page.

---

## Paste-Ready Content Block

### App Name
```
GetPostFlow
```

### App Description (for OAuth consent screen and verification form)

```
GetPostFlow is an AI-powered social media management platform for small and medium-sized businesses and the agencies serving them. GetPostFlow connects to YouTube via the YouTube Data API v3 to enable content scheduling, publishing, analytics retrieval, and comment management for YouTube channels owned by GetPostFlow's end-users.

What GetPostFlow does with YouTube access:

Video Publishing (including YouTube Shorts): GetPostFlow allows teams to upload and publish videos to connected YouTube channels on behalf of authorized users. Videos are uploaded using the resumable upload protocol (videos.insert with uploadType=resumable) to handle large files reliably. Metadata including title, description, tags, category, and privacy status is set at upload time. YouTube Shorts are published using the same API; video duration and the #Shorts tag in the description determine classification by YouTube.

Content Scheduling: Videos are scheduled by setting status.publishAt to a future timestamp with status.privacyStatus set to private at upload, then automatically transitioning to public via the scheduling engine.

Comment Management: GetPostFlow retrieves comments from YouTube videos (commentThreads.list) to surface them in the unified inbox. Team members draft replies and submit them for human review before posting.

Analytics: GetPostFlow retrieves channel and video analytics using the YouTube Analytics API (reports.query) to populate performance dashboards — including views, watch time, subscribers gained, impressions, and click-through rate.
```

### Tagline (155 characters)
```
Schedule, publish, and analyze YouTube and YouTube Shorts content — with AI-assisted creation and client approval workflows built in.
```

### Scope Justifications (for verification form — one per scope)

```
https://www.googleapis.com/auth/youtube.upload
Justification: Required to upload video content (including YouTube Shorts) to the authenticated user's YouTube channel using the videos.insert endpoint with resumable upload. This is the core YouTube publishing capability of GetPostFlow — without this scope, GetPostFlow cannot publish any video on behalf of the user.

https://www.googleapis.com/auth/youtube
Justification: Required for channel management operations beyond upload — specifically: updating video metadata after upload (title, description, tags, privacy status), managing the video's scheduled publish time (status.publishAt), and reading channel details necessary to associate the connected account with the correct GetPostFlow workspace.

https://www.googleapis.com/auth/youtube.readonly
Justification: Required to read channel information, video lists, and subscription data for display in GetPostFlow's connected accounts panel and content history views. This scope is used in read-only contexts where write access is not needed.

https://www.googleapis.com/auth/youtube.force-ssl
Justification: Required by Google's API as a prerequisite for all comment management operations via the commentThreads and comments endpoints. GetPostFlow uses this scope to read comments on published videos (commentThreads.list) and to post human-approved replies (commentThreads.insert).

https://www.googleapis.com/auth/yt-analytics.readonly
Justification: Required to retrieve channel and video analytics metrics (views, watch time, subscribers gained, impressions, click-through rate) from the YouTube Analytics API (reports.query) to populate GetPostFlow's performance dashboards and generate client-ready analytics reports.
```

### Demo Video Script

**Target length:** 3–5 minutes
**Format:** Screen recording with voiceover. Use a real Google/YouTube test account.

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

## TODOs Requiring User Action

1. **Create the Google Cloud project** `getpostflow-production` at https://console.cloud.google.com.
2. **Enable YouTube Data API v3** in APIs & Services → Library.
3. **Verify the domain** `vercel.app` in Google Search Console and link it to the Cloud project before verification submission — Google checks domain ownership.
4. **Produce the 1024×1024 px app logo** for the OAuth consent screen.
5. **Ensure the Privacy Policy at `https://getpostflow.vercel.app/privacy` complies with the Google API Services User Data Policy** — explicitly reference Google API data and YouTube data handling.
6. **Create a non-personal Google test account** with a test YouTube channel (several published videos) for use as reviewer credentials.
7. **Record the demo video** using the script above — upload as unlisted YouTube or Vimeo video and save the URL for the verification submission form.
8. **Submit a separate quota increase request** via APIs & Services → Quotas once initial OAuth approval is granted — document expected usage patterns before filing.
9. **After Custom Domain cutover to `getpostflow.com`:** add `https://getpostflow.com/api/oauth/youtube/callback` as an additional authorized redirect URI in Credentials → OAuth client ID settings, and add `getpostflow.com` as an authorized domain in the OAuth consent screen.
10. **Monitor the developer account email** throughout the review — Google sends verification status updates and may request additional information.
