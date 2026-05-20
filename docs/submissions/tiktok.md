# TikTok — Submission Playbook
<!-- Source: https://developers.tiktok.com -->

> **Risk flag:** TikTok production scopes are the **highest approval risk** in this submission set. Submit this packet in Phase 0 before app code is finalized. Budget **4–8 weeks** for approval.

---

## Console URL

https://developers.tiktok.com

---

## Prerequisites

- A TikTok Business account (personal accounts have lower priority for production API access)
- App icon prepared: 1024×1024 px JPEG or PNG, max 5 MB
- Privacy Policy live at `https://getpostflow.vercel.app/privacy` — must explicitly reference TikTok Platform Data
- Terms of Service live at `https://getpostflow.vercel.app/terms`
- Domain verified (see Step 5) — required before submitting Terms of Service and Privacy Policy URLs
- Demo environment functional and accessible for reviewers
- Demo videos prepared: 1–5 videos, max 50 MB each (see Demo Video Script in Content Block)

---

## Step-by-Step

### Step 1: Create the App / Account Setup

1. Navigate to **https://developers.tiktok.com**.
2. Click **"Login"** (top-right).
3. Sign in with your TikTok Business account credentials.
4. After signing in, click your **profile icon** in the top-right corner.
5. Click **"Manage apps"** from the dropdown menu.

---

### Step 2: Configure Basic Info

1. On the Manage Apps page, click **"Connect an app"** (<!-- Verify in console: button labeled approximately "Connect an app" or "Create app" -->).
2. **Select the app owner:**
   - If you have a registered organization: select the organization as the owner.
   - If no organization: select your personal account.
   - <!-- Verify in console: modal or step asking you to select "Organization" or "Personal" as app owner -->
3. Fill in the app details form:
   - **App icon:** click the upload area → select your 1024×1024 px JPEG or PNG (max 5 MB)
   - **App name:** `GetPostFlow`
   - **App description:** paste the description from the Paste-Ready Content Block below
   - **Category:** select **"Tools & Utilities"** or **"Business"** (<!-- Verify in console: dropdown options — select the closest match to a social media management tool -->)
   - **Platforms:** select **"Web"**
4. Click **"Save"** or **"Next"** to proceed (<!-- Verify in console: button labeled approximately "Save" or "Next" at the bottom of the form -->).

---

### Step 3: Request Products / Add Permissions / Add Scopes

**Critical step.** In your app dashboard, locate the **"Add products"** section and click **"Add products"**.

#### Product 1: Login Kit

- **Exact name:** `Login Kit`
- **Why GetPostFlow needs it:** Provides the OAuth 2.0 login flow that allows TikTok Business account holders to authenticate and connect their TikTok account to GetPostFlow. Required before any other scopes can be used.
- **Auto-approved or manual review:** Available to configure immediately; scopes associated with the app still require App Review for production.
- **Setup after adding:**
  - Locate the Login Kit settings panel.
  - **Redirect URI:** paste exactly:
    ```
    https://getpostflow.vercel.app/api/oauth/tiktok/callback
    ```
    <!-- Verify in console: field labeled approximately "Redirect URI" or "Redirect domain" -->
  - **Terms of Service URL:** `https://getpostflow.vercel.app/terms`
  - **Privacy Policy URL:** `https://getpostflow.vercel.app/privacy`

#### Product 2: Content Posting API

- **Exact name:** `Content Posting API`
- **Why GetPostFlow needs it:** Enables GetPostFlow to upload and publish video content to connected TikTok Business accounts via the Direct Post and Inbox Post flows. This is the core TikTok publishing capability.
- **Auto-approved or manual review:** **Manual review required** for production access.
- **Setup after adding:** configure in the products panel.

#### Configure Scopes

After adding products, navigate to the **Scopes** section of your app dashboard. Enable the following scopes and note their approval type:

| Scope | Why GetPostFlow Needs It | Approval |
|---|---|---|
| `user.info.basic` | Required to retrieve the authenticated user's TikTok account identity (display name, avatar, open ID) so the correct account is shown in GetPostFlow's connected accounts list. | App Review |
| `video.publish` | Required to publish video content to the authenticated user's TikTok account via the Content Posting API. This is the core TikTok publishing scope. | App Review |
| `video.upload` | Required as part of the Direct Post or Inbox Post flow to upload video files before the publish step. Used in conjunction with `video.publish`. | App Review |
| `video.list` | Required to retrieve the list of published videos for the connected account, enabling analytics display and post-history tracking within GetPostFlow. | App Review |

> **TODO (user action required):** Verify exact scope names against the current TikTok for Developers scope reference at https://developers.tiktok.com before submission. TikTok occasionally renames scopes between API versions. Update this list if any scope name has changed.

---

### Step 4: OAuth / Redirect Configuration

1. In the Login Kit product settings, confirm the redirect URI is set to:

```
https://getpostflow.vercel.app/api/oauth/tiktok/callback
```

2. This URI must be an **exact match** — no trailing slashes, no query parameters.
3. <!-- Verify in console: field labeled approximately "Redirect URI" or "Valid redirect domains" in Login Kit settings -->

---

### Step 5: URL Properties — Domain Verification

TikTok requires domain ownership verification for the Terms of Service URL, Privacy Policy URL, and Web URL before submission.

1. In your app dashboard, navigate to **"URL properties"** (<!-- Verify in console: section or tab labeled approximately "URL properties" or "Domain verification" -->).
2. Click to add the domain: `https://getpostflow.vercel.app`.
3. TikTok will provide a verification method — typically a DNS TXT record or an HTML meta tag (<!-- Verify in console: instructions labeled approximately "Verify domain ownership" with a DNS record or file upload method -->).
4. Complete the domain verification per TikTok's instructions.
5. After verification, fill in:
   - **Terms of Service URL:** `https://getpostflow.vercel.app/terms`
   - **Privacy Policy URL:** `https://getpostflow.vercel.app/privacy`
   - **Web URL:** `https://getpostflow.vercel.app`

> **TODO (user action required):** Complete domain verification before submitting for App Review. Unverified domains block the submission step.

---

### Step 6: Submit for Review

1. In your app dashboard, navigate to the **"App review"** section (<!-- Verify in console: sidebar item or tab labeled approximately "App review" -->).
2. For each product and scope, provide a written justification:
   - Explain what the product/scope enables in GetPostFlow
   - Reference the specific feature that uses it
   - Use the scope justifications from the Paste-Ready Content Block below
3. Upload demo videos:
   - **Quantity:** 1–5 videos
   - **Max size per video:** 50 MB each
   - Videos must demonstrate every scope being used in the app
   - Use the Demo Video Script from the Content Block below
   - <!-- Verify in console: file upload area labeled approximately "Upload demo videos" or "Demo video" in the App review section -->
4. Click **"Submit for review"** (<!-- Verify in console: button labeled approximately "Submit for review" or "Submit" at the bottom of the App review page -->).

**Review statuses to expect:** `Draft` → `In review` → `Live` or `Not approved`

**Demo video requirements:**
- Length: 3–5 minutes per video
- Format: screen recording with voiceover
- Must use a real TikTok Business test account
- Must demonstrate every scope being used
- See full script in Paste-Ready Content Block

**Screenshot list:**
1. TikTok OAuth consent screen — permissions list visible during Login Kit flow
2. Connected TikTok account — account listed in GetPostFlow's connected accounts panel
3. Content composer — video upload, caption, hashtags, schedule field
4. Approval workflow — content in "pending review" state
5. Approved and scheduled state — content in calendar view
6. Publish confirmation — success state after Content Posting API call
7. Live TikTok post — video appearing on the test account's profile
8. Analytics dashboard — video metrics and account analytics populated
9. Disconnect account — Settings page showing revocation option

**Test credentials:**

> **TODO (user action required):**
> 1. Register as a TikTok for Developers developer at https://developers.tiktok.com.
> 2. Create a TikTok Business test account (sandbox or real account with minimal followers).
> 3. Connect the test account to GetPostFlow staging.
> 4. Provide TikTok App Review with:
>    - TikTok Business account credentials for the test account
>    - Login credentials for GetPostFlow staging environment
>    - URL to reach the staging environment
>    - Step-by-step instructions to reach the TikTok connect flow

---

### Step 7: Wait for Approval

- **Review window:** **4–8 weeks** for production Content Posting API access.
- **Where to track status:** App review section of your app dashboard — status badge shows `Draft`, `In review`, `Live`, or `Not approved`.
- **Email notifications:** TikTok sends status updates to the developer account email.

**Common rejection reasons:**
- Business not verified or developer account not business-tier
- Scope requested but not demonstrated in the video
- App uses deprecated Share API references (use Content Posting API only)
- Privacy policy does not cover TikTok data
- Staging environment not functional at time of review
- App appears to be analytics-only while requesting publish scopes — publish demo must be clear

**If rejected:**
- Review the rejection feedback from TikTok.
- Update the demo video to more clearly demonstrate each scope.
- Add a written use-case document as a supplemental attachment.
- Resubmit via the App review section.

---

## Paste-Ready Content Block

### App Name
```
GetPostFlow
```

### App Description (for the app details form)

```
GetPostFlow is an AI-powered social media management platform built for small and medium-sized businesses and the agencies managing their brand presence. GetPostFlow enables teams to plan, generate, approve, schedule, and publish content to TikTok Business accounts while pulling in engagement analytics to measure performance — all within a structured, approval-first workflow.

What GetPostFlow does with TikTok access:

- Video publishing: Team members and authorized clients can schedule and publish video content to connected TikTok Business accounts. Every video passes through an internal team review and optionally a client approval step before any publish action is executed.
- Content scheduling: Schedule TikTok posts at specific dates and times using GetPostFlow's scheduling engine, which queues and publishes content via the Content Posting API at the designated time.
- OAuth account management: End-users authenticate with their TikTok Business accounts via TikTok Login Kit. GetPostFlow stores the resulting access tokens encrypted at rest and refreshes them proactively before expiry.

GetPostFlow does not scrape TikTok, does not interact with TikTok's consumer app outside of authorized API channels, and does not auto-respond to TikTok comments without human approval.
```

### Tagline (160 characters)
```
AI-powered social media management for growing businesses — schedule, publish, and analyze TikTok content with client-safe approval workflows.
```

### Scope Justifications (for App Review form)

```
user.info.basic — Required to retrieve the authenticated user's TikTok account identity (display name, avatar, open ID) so the correct account is shown in GetPostFlow's connected accounts list.

video.publish — Required to publish video content to the authenticated user's TikTok account via the Content Posting API. This is the core TikTok publishing capability of GetPostFlow.

video.upload — Required as part of the Direct Post or Inbox Post flow to upload video files before the publish step. Used in conjunction with video.publish.

video.list — Required to retrieve the list of published videos for the connected account, enabling analytics display and post-history tracking within GetPostFlow.
```

### Demo Video Script

**Target length:** 3–5 minutes
**Format:** Screen recording with voiceover. Use a real TikTok Business test account.

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
- Show video views, likes, and account follower metrics populated.

**[2:50–3:20] Token Management / Disconnect**
- Navigate to Settings → Connected Accounts.
- Show the disconnect flow — token revoked, account removed from list.

**[3:20–3:40] Closing**
- Recap each scope used, name it explicitly, and state its purpose.
- Confirm no consumer data is accessed outside authorized API channels.

---

## TODOs Requiring User Action

1. **Register a TikTok Business developer account** at https://developers.tiktok.com if not already done — personal accounts have lower priority for production publishing scopes.
2. **Produce the 1024×1024 px app icon** (JPEG or PNG, max 5 MB) before creating the app.
3. **Verify domain ownership** for `https://getpostflow.vercel.app` via the URL properties section before submitting.
4. **Ensure the Privacy Policy at `https://getpostflow.vercel.app/privacy` explicitly references TikTok Platform Data** — generic policies are rejected.
5. **Create a TikTok Business test account** for use as reviewer credentials and connect it to the staging environment.
6. **Record 1–5 demo videos** (max 50 MB each) using the script above with a real TikTok Business test account.
7. **Verify final scope names** against https://developers.tiktok.com before submission — scope names can change between API versions.
8. **Do not reference the deprecated TikTok Share API** anywhere in submission materials — use Content Posting API only.
9. **After Custom Domain cutover to `getpostflow.com`:** update the redirect URI in Login Kit settings to add `https://getpostflow.com/api/oauth/tiktok/callback` and re-verify the new domain in URL properties.
