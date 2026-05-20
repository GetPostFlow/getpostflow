# Meta — Submission Playbook
<!-- Source: https://developers.facebook.com -->

## Console URL

https://developers.facebook.com

---

## Prerequisites

- A Facebook account registered as a Meta developer (complete at https://developers.facebook.com → "Get Started")
- A Meta Business Account for GetPostFlow (create at https://business.facebook.com if not yet created)
- A test Facebook Page (must have posts and comments before filming the demo — not a blank page)
- A test Instagram Business account linked to that Facebook Page
- App icon prepared: 1024×1024 px PNG
- Privacy Policy live at `https://getpostflow.vercel.app/privacy` — must explicitly mention Meta Platform Data
- Terms of Service live at `https://getpostflow.vercel.app/terms`
- App Domains value ready: `getpostflow.vercel.app`
- Business Verification completed (see Step 6) before submitting advanced permissions

---

## Step-by-Step

### Step 1: Create the App / Account Setup

1. Navigate to **https://developers.facebook.com**.
2. Click **"My Apps"** in the top-right navigation (or **"Get Started"** if you have not yet registered as a developer).
3. If registering for the first time: complete the developer registration — verify your email address and accept the Meta Platform Terms.
4. On the My Apps page, click **"Create App"**.
5. Select the use case:
   - Choose **"Other"** to get full control over which products to add manually.
   - <!-- Verify in console: use case tile labeled approximately "Other" — selecting "Business" or "Business" type is also valid -->
   - Click **"Next"**.
6. Fill in the app details:
   - **App name:** `GetPostFlow`
   - **App contact email:** your developer account email
   - **Business account:** select the GetPostFlow Meta Business Account from the dropdown (or attach one after creation)
7. Click **"Create app"**. Meta may prompt you to complete a security check.

---

### Step 2: Configure Basic Info

1. You land on the App Dashboard. In the left sidebar, click **"App Settings"** → **"Basic"**.
2. Fill in all required fields:
   - **Display name:** `GetPostFlow` (should already be set)
   - **App Domains:** `getpostflow.vercel.app`
   - **Privacy Policy URL:** `https://getpostflow.vercel.app/privacy`
   - **Terms of Service URL:** `https://getpostflow.vercel.app/terms`
   - **App Icon:** upload the 1024×1024 px PNG
   - **Category:** select **"Business & Pages"** (<!-- Verify in console: dropdown option labeled approximately "Business & Pages" -->)
3. Click **"Save Changes"**.
4. Note your **App ID** (shown at the top of the Basic settings page) — save it securely.
5. Click **"Show"** next to **App Secret** — save securely.

---

### Step 3: Request Products / Add Permissions / Add Scopes

**Critical step.** In the left sidebar, click **"Add a product"** (or **"Products"** → **"+"**). For each product below, find it in the product catalog and click **"Set up"**.

#### Product 1: Facebook Login for Business

- **Exact name:** `Facebook Login for Business`
- **Why GetPostFlow needs it:** Provides the OAuth flow for business users to connect their Facebook Pages and Instagram accounts to GetPostFlow. Enables requesting all page and Instagram permissions scoped to the authenticated user's pages.
- **Auto-approved or manual review:** Basic setup is available immediately; individual permissions require App Review.
- **Setup:** Click **"Set up"** → in Facebook Login for Business settings, add the redirect URI:
  ```
  https://getpostflow.vercel.app/api/oauth/meta/callback
  ```
  <!-- Verify in console: field labeled approximately "Valid OAuth Redirect URIs" -->

#### Product 2: Instagram Graph API

- **Exact name:** `Instagram Graph API`
- **Why GetPostFlow needs it:** Provides access to Instagram Business account publishing (`instagram_content_publish`), analytics (`instagram_manage_insights`), comment management (`instagram_manage_comments`), and messaging (`instagram_manage_messages`).
- **Auto-approved or manual review:** `instagram_basic` is available in development; all other Instagram permissions require App Review.
- **Setup:** Click **"Set up"** on the Instagram Graph API product card.

#### Product 3: Webhooks

- **Exact name:** `Webhooks`
- **Why GetPostFlow needs it:** Enables real-time event subscriptions for Facebook Page feed events, Instagram media updates, and messaging events, so GetPostFlow's inbox and analytics stay current without constant polling.
- **Auto-approved or manual review:** Webhooks product can be added immediately; individual subscriptions require the corresponding permissions to be approved.
- **Setup:** Click **"Set up"** → configure callback URL:
  ```
  https://getpostflow.vercel.app/api/webhooks/meta
  ```
  <!-- Verify in console: field labeled approximately "Callback URL" and "Verify token" -->

#### Permissions to Request via App Review

Navigate to **App Review** → **"Permissions and Features"** in the left sidebar. For each permission below, click **"Request"** or **"Add to Submission"**, then provide the justification listed:

| Permission | Justification | Approved By |
|---|---|---|
| `pages_show_list` | Required to enumerate Facebook Pages the user manages so they can connect a Page to GetPostFlow. | App Review |
| `pages_read_engagement` | Required to read Page posts, comments, and reactions for unified inbox and analytics. | App Review |
| `pages_manage_posts` | Required to create, schedule, and publish posts to managed Facebook Pages. Core publishing capability. | App Review |
| `pages_manage_engagement` | Required to post replies to comments on Page posts when a team member approves a response. | App Review |
| `pages_read_user_content` | Required to read visitor-posted comments and reviews on managed Pages for inbox monitoring. | App Review |
| `pages_manage_metadata` | Required to subscribe Page webhooks for real-time feed and messaging events. | App Review |
| `read_insights` | Required to retrieve Page-level insights (reach, impressions, engagement) for analytics dashboards. | App Review |
| `business_management` | Required to read Business Manager metadata to associate Pages with the correct GetPostFlow workspace. | App Review |
| `instagram_basic` | Required as baseline access to the connected Instagram Business account linked to the authorized Page. | App Review |
| `instagram_content_publish` | Required to publish photos, videos, Reels, and carousels to Instagram Business/Creator accounts. Core Instagram publishing. | App Review |
| `instagram_manage_comments` | Required to read and reply to comments on Instagram media in the unified inbox. | App Review |
| `instagram_manage_insights` | Required to retrieve media-level and account-level Instagram insights for analytics and reporting. | App Review |
| `instagram_manage_messages` | Required to read and reply to Instagram Direct Messages in the unified inbox. | App Review (advanced) |

---

### Step 4: OAuth / Redirect Configuration

1. In the left sidebar, navigate to **Facebook Login for Business** → **Settings**.
2. Locate the **"Valid OAuth Redirect URIs"** field.
3. Add the following URI exactly:

```
https://getpostflow.vercel.app/api/oauth/meta/callback
```

4. Click **"Save Changes"**.
5. Verify the URI appears with no trailing slash and no extra characters.

---

### Step 5: Submit for Review

#### Pre-submission checklist

Before submitting for App Review:

- [ ] App is switched to **Live** mode: App Settings → Basic → toggle **"App Mode"** from **Development** to **Live** (<!-- Verify in console: toggle labeled approximately "App Mode: Development / Live" or a "Switch to Live" button -->)
- [ ] Business Verification is complete (see Step 6 below)
- [ ] All permissions are added to the submission in App Review → Permissions and Features
- [ ] Demo video is recorded per the script in the Content Block below
- [ ] Test credentials are prepared (see TODOs)

#### App Review submission steps

1. In the left sidebar, navigate to **App Review** → **"Permissions and Features"**.
2. For each permission, click **"Request"**:
   - Select the permission → click **"Request Access"**
   - Fill in the justification (use paste-ready text from the Content Block)
   - Upload the demo video or provide a link
   - Provide the test account credentials
3. After all permissions are added to the submission, click **"Submit for Review"**.
4. <!-- Verify in console: button labeled approximately "Submit for Review" at the top of the Permissions and Features page -->

**Demo video requirements:**
- Length: 3–5 minutes
- Format: screen recording with voiceover
- Must use a real, populated test Facebook Page and Instagram Business account
- Must show every permission being actively used
- Must narrate each permission by name as it is exercised
- See Demo Video Script in the Paste-Ready Content Block below

**Screenshot list:**
1. OAuth consent screen — permission request list during Meta Login flow
2. Connected accounts list — Facebook Page and Instagram account listed after authorization
3. Content composer — creating a post with image, caption, platform selectors
4. Content calendar — scheduled post visible before publish
5. Published post confirmation — post live on test Facebook Page
6. Unified inbox — Facebook comment appearing in the inbox
7. AI response suggestion with approve/edit buttons visible
8. Reply sent confirmation — response visible on the Facebook post
9. Analytics dashboard — Page insights (reach, impressions, engagement)
10. Instagram insights panel — media insights from `instagram_manage_insights`
11. Disconnect account — Settings page showing token revocation option

> All screenshots must use a genuine test Page/account — not mockups or placeholder images.

**Test credentials:**

> **TODO (user action required):**
> 1. Create a dedicated Meta Developer test user via your Meta Developer app → Roles → Test Users.
> 2. Create a test Facebook Page owned by the test user.
> 3. Link a test Instagram Business account to the test Page.
> 4. Provide Meta App Review with:
>    - Email and password for the test user
>    - Any 2FA codes or instructions
>    - URL of the GetPostFlow staging environment
>    - Login credentials for the GetPostFlow staging account that has the test Page connected

---

### Step 6: Business Verification

Business Verification is required before advanced permissions are granted.

1. Go to **Meta Business Settings** at https://business.facebook.com/settings.
2. In the left sidebar, navigate to **"Business info"** → **"Start Verification"** (<!-- Verify in console: button labeled approximately "Start Verification" or "Verify Business" in the Business Info section -->).
3. Follow the verification flow — you will need:
   - Legal business name matching your developer account
   - Business address
   - Business phone number
   - A government-issued document confirming the business (incorporation certificate or similar)
4. Submit. Verification typically takes a few business days.

> **TODO (user action required):** Complete Business Verification before submitting for advanced permissions. Unverified businesses face higher rejection rates for permissions like `instagram_manage_messages` and `business_management`.

---

### Step 7: Wait for Approval

- **Standard permissions timeline:** 2–5 business days.
- **Advanced permissions timeline:** 1–3 weeks (especially `pages_manage_engagement`, `instagram_manage_messages`).
- **Where to track status:** App Review → Permissions and Features — each permission shows its review status.
- **Email notifications:** Meta sends status updates to the app contact email.

**Common rejection reasons:**
- Permission not demonstrated in the screencast
- Privacy policy URL returns 404 or does not cover Meta Platform Data
- App not in Live mode at time of review
- Missing Business Verification
- Requesting `business_management` without showing a business use case
- Test account credentials not provided or expired during review

**If rejected:** Address the specific feedback from the rejection notice, update the demo video if needed, and resubmit the affected permissions individually.

---

## Paste-Ready Content Block

### App Name
```
GetPostFlow
```

### App Description (for App Review justification notes)

```
GetPostFlow is a multi-platform AI social media management SaaS built for small and medium-sized businesses and the agencies that serve them. It provides a unified dashboard for content creation, scheduling, publishing, community inbox management, and performance analytics across Facebook and Instagram alongside other supported platforms.

What GetPostFlow does with Facebook and Instagram access:

GetPostFlow connects to Facebook Pages and Instagram Business/Creator accounts on behalf of end-user businesses. Once connected, the platform enables:

- Content publishing: Schedule and publish posts, photos, videos, carousels, and Reels to Facebook Pages and Instagram Business accounts. Content is drafted and approved through a structured internal and client approval workflow before any publish action is taken.
- Media analytics: Pull post-level and page/account-level insights (reach, impressions, engagement, follower growth) to populate performance dashboards and client-ready reports.
- Unified inbox: Aggregate comments, messages (where permitted), and mentions from Facebook Pages and Instagram into a normalized inbox for team review, response drafting, and AI-assisted engagement suggestions. All responses go through human approval before sending.
- Client approval workflows: Let end-user clients review and approve scheduled content from a dedicated client portal.
- Webhook event handling: Subscribe to real-time events for Page feeds, Instagram media, and messaging to keep inbox and analytics data current.

GetPostFlow does not store user passwords. All access is OAuth-based, scoped to the minimum permissions required for each feature, and tokens are encrypted at rest.
```

### Tagline (160 characters)
```
AI-powered social media management for growing businesses — publishing, inbox, analytics, and client approvals in one platform.
```

### Individual Permission Justifications

```
pages_show_list — Required to enumerate the Facebook Pages the user manages so they can connect a Page to their GetPostFlow workspace. Without this, users cannot select which Page to manage.

pages_read_engagement — Required to read Page posts, comments, and reactions for unified inbox aggregation and analytics reporting.

pages_manage_posts — Required to create, schedule, and publish posts to managed Facebook Pages on behalf of users. This is the core publishing capability.

pages_manage_engagement — Required to post replies to comments on Page posts when a team member approves a suggested response through the inbox.

pages_read_user_content — Required to read visitor-posted content (comments, reviews) on managed Pages for inbox monitoring.

pages_manage_metadata — Required to subscribe Page webhooks so GetPostFlow receives real-time feed and messaging events.

read_insights — Required to retrieve Page-level insights (reach, impressions, engagement metrics) for analytics dashboards and scheduled reports.

business_management — Required to read Business Manager metadata to correctly associate Pages and Instagram accounts with the right business workspace in GetPostFlow.

instagram_basic — Required as a baseline to access the connected Instagram Business account linked to the authorized Facebook Page.

instagram_content_publish — Required to publish photos, videos, Reels, carousels, and Stories to the connected Instagram Business/Creator account. This is the core Instagram publishing capability.

instagram_manage_comments — Required to read and reply to comments on Instagram media, enabling the unified inbox to surface and manage Instagram engagement.

instagram_manage_insights — Required to retrieve media-level and account-level insights (reach, impressions, engagement, saves, follower count) for analytics and reporting.

instagram_manage_messages — Required to read and reply to Instagram Direct Messages in the unified inbox where the user has a Business account with DM access enabled.
```

### Token Handling Statement
```
Access tokens are stored encrypted at rest using AES-256. Long-lived page tokens are obtained and refreshed proactively before expiry. Users can disconnect their Meta accounts at any time from the GetPostFlow settings page, which immediately revokes stored tokens.
```

### Demo Video Script

**Target length:** 3–5 minutes
**Format:** Screen recording with voiceover. Show a real test Facebook Page and test Instagram Business account.

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

## TODOs Requiring User Action

1. **Complete Meta Developer registration** at https://developers.facebook.com if not already done.
2. **Create the GetPostFlow Meta Business Account** at https://business.facebook.com before creating the app so it can be attached during app creation.
3. **Complete Business Verification** via Meta Business Settings → Business Info → Start Verification before submitting for advanced permissions.
4. **Switch the app from Development to Live mode** (App Settings → Basic → App Mode toggle) before submitting for App Review.
5. **Create a test Facebook Page** with existing posts and comments (not a blank page) before filming the demo video.
6. **Link a test Instagram Business account** to the test Facebook Page.
7. **Create a Meta test user** via App → Roles → Test Users for providing reviewer credentials.
8. **Ensure the Privacy Policy at `https://getpostflow.vercel.app/privacy` explicitly mentions Meta Platform Data** — add a "Social Platform Data" section covering Facebook and Instagram data handling.
9. **Record the demo video** using the script above with real accounts — not mockups.
10. **After Custom Domain cutover to `getpostflow.com`:** add `https://getpostflow.com/api/oauth/meta/callback` as an additional redirect URI in Facebook Login for Business settings.
