# Pinterest — Submission Playbook
<!-- Source: https://developers.pinterest.com -->

---

## Console URL

https://developers.pinterest.com

---

## Prerequisites

- A Pinterest Business account for GetPostFlow (personal accounts cannot access all API scopes)
- Email address verified on your Pinterest account
- Privacy Policy live at `https://getpostflow.vercel.app/privacy` — must explicitly reference Pinterest data handling
- Terms of Service live at `https://getpostflow.vercel.app/terms`
- Website URL live: `https://getpostflow.vercel.app`
- A test Pinterest Business account with at least one board and a few Pins (populated before filming the demo)
- GetPostFlow staging environment functional and accessible

---

## Step-by-Step

### Step 1: Create the App / Account Setup

1. Navigate to **https://developers.pinterest.com**.
2. Click **"Sign in"** (top-right) and sign in with your Pinterest Business account.
3. **Verify your email address** if not yet verified:
   - Go to your Pinterest account settings → Email settings → verify email
   - <!-- Verify in console: notification or prompt labeled approximately "Verify your email" on the developer portal landing page -->
4. **Accept the Pinterest Developer Terms of Service:**
   - On the developer portal, locate the Terms of Service acceptance prompt and click to accept (<!-- Verify in console: modal or banner labeled approximately "Accept Developer Terms of Service" or "Agree to Terms" -->).
5. Navigate to **"My apps"** or go directly to **https://developers.pinterest.com/apps/**.
6. Click **"Connect app"** (<!-- Verify in console: button labeled approximately "Connect app" or "Create app" on the apps listing page -->).

---

### Step 2: Configure Basic Info

1. Fill in the app details form:
   - **App name:** `GetPostFlow`
   - **Description:** paste the description from the Paste-Ready Content Block below
   - **Website URL:** `https://getpostflow.vercel.app`
2. Click **"Create"** or **"Save"** (<!-- Verify in console: button labeled approximately "Create" or "Register app" at the bottom of the form -->).
3. After creation, you land on the app details page:
   - Note your **App ID** — save it securely.
   - Note your **App secret key** — save it securely. This may only be shown once or be copyable from the credentials section.
4. Verify the app is listed in **My apps**.

---

### Step 3: Request Products / Add Permissions / Add Scopes

**Critical step.** On the app details page, locate the scopes or permissions configuration section. Select the checkboxes for the following scopes:

| Scope | Why GetPostFlow Needs It | Approval |
|---|---|---|
| `boards:read` | Required to retrieve the list of boards on the connected Pinterest Business account so users can select a target board when scheduling a Pin in GetPostFlow. | Review process |
| `pins:read` | Required to retrieve existing Pins from the connected account for content history display and analytics correlation within GetPostFlow. | Review process |
| `pins:write` | Required to create and publish Pins to the connected Pinterest Business account. This is the core Pinterest publishing capability of GetPostFlow. | Review process |
| `user_accounts:read` | Required to retrieve the authenticated user's Pinterest account information (username, profile) for display in the connected accounts panel. | Review process |
| `ads:read` | Required to retrieve Pin analytics (impressions, saves, clicks, engagement) from the Pinterest Analytics API to populate GetPostFlow's performance dashboards. **Verify in console: confirm this is the correct scope name for organic Pin analytics — it may differ for non-ads analytics access.** | Review process |

> **Note on `boards:write`:** This scope enables creating new boards on behalf of users. It is optional for v1 and can be deferred to a later scope request if board creation is not in the initial feature set. Do not request it unless the feature is implemented and demonstrable.

> **TODO (user action required):** Verify scope names against the current Pinterest API v5 reference at https://developers.pinterest.com/docs/api/v5/ — confirm `ads:read` is the correct scope for organic Pin analytics or if a different scope applies.

---

### Step 4: OAuth / Redirect Configuration

1. On the app details page, locate the **Redirect URIs** or **OAuth settings** section (<!-- Verify in console: field labeled approximately "Redirect URIs" or "Authorized redirect URIs" -->).
2. Add the following redirect URI exactly — Pinterest requires an **exact match**, including the path:

```
https://getpostflow.vercel.app/api/oauth/pinterest/callback
```

3. Save the configuration.
4. **Important:** Pinterest validates redirect URIs as exact strings. Ensure there are no trailing slashes, no uppercase letters, and no query parameters.

---

### Step 5: Submit for Review

1. After configuring scopes and the redirect URI, locate the **App Review** or **Trial access** section on the app details page (<!-- Verify in console: section labeled approximately "App Review", "Request access", or "Trial access tier" -->).
2. Pinterest offers a **Trial access tier** which provides limited API access for development and testing — this is available without a full review. Use Trial access to build and test the integration.
3. To apply for full production access: locate the review submission form and provide:
   - Use case description (paste from Paste-Ready Content Block)
   - Justification for each scope
   - Website URL: `https://getpostflow.vercel.app`
   - Privacy Policy URL: `https://getpostflow.vercel.app/privacy`
   - Demo video (see Demo Video Script in Content Block)

**Demo video requirements:**
- Length: 3–4 minutes
- Format: screen recording with voiceover
- Must use a real Pinterest Business test account
- Must show every scope being used
- See Demo Video Script in Paste-Ready Content Block

**Screenshot list:**
1. Pinterest OAuth consent screen — scopes visible during authorization
2. Connected Pinterest account — account listed in GetPostFlow
3. Content composer — Pin title, description, image, board selector, schedule
4. Board selector populated — boards list from `boards:read`
5. Approval workflow — Pin in review state
6. Published Pin — live on test Pinterest board
7. Analytics dashboard — Pinterest Pin and account metrics
8. Disconnect account — Settings page with revocation option

**Test credentials:**

> **TODO (user action required):**
> 1. Create a Pinterest developer app at https://developers.pinterest.com/.
> 2. Set up a Pinterest Business test account with at least one board and a few Pins.
> 3. Connect the test account to GetPostFlow staging.
> 4. Provide the Pinterest review process with:
>    - Pinterest Business account credentials
>    - GetPostFlow staging login credentials
>    - URL of the staging environment
>    - Step-by-step instructions to reach the Pinterest OAuth connect flow

---

### Step 6: Wait for Approval

- **Review window:** **3–10 business days** for standard scopes. Pinterest's process is more straightforward than LinkedIn or TikTok.
- **Where to track status:** App details page — the app shows its current access status (<!-- Verify in console: status label approximately "Trial", "In review", or "Approved" -->).
- **Email notifications:** Pinterest sends status updates to the developer account email.

**Common rejection reasons:**
- App domain not live or returns errors at review time
- Scopes requested but not demonstrated in the demo
- Privacy policy missing or not referencing Pinterest data
- Using deprecated API version endpoints (use Pinterest API v5 only)
- Personal account used instead of Business account

**If rejected:**
- Review the feedback provided.
- Update the demo or scope justifications to address the issue.
- Resubmit via the App Review section.

---

## Paste-Ready Content Block

### App Name
```
GetPostFlow
```

### App Description (for app details form)

```
GetPostFlow is an AI-powered social media management platform for small and medium-sized businesses and the agencies managing their brand presence. GetPostFlow integrates with the Pinterest API v5 to enable end-users to schedule and publish Pins, manage boards, and retrieve analytics — all within a structured approval workflow.

What GetPostFlow does with Pinterest access:

- Pin publishing: Create and schedule Pins (image and video) to boards on the connected Pinterest Business account. GetPostFlow uses the pins.create endpoint to publish scheduled content. Content passes through internal review and optional client approval before publishing.
- Board management: Read the list of boards available on the connected account so users can select the target board when creating a Pin.
- Analytics: Retrieve Pin and account-level analytics (impressions, saves, clicks, engagement) for performance dashboards and client reports.
- OAuth account management: Users authenticate via Pinterest OAuth 2.0. Tokens are encrypted at rest and refreshed proactively.

GetPostFlow operates exclusively on Pinterest Business accounts. It does not access personal Pinterest accounts.
```

### Tagline (120 characters)
```
Plan, schedule, and publish Pins to Pinterest — with AI-assisted content creation and performance analytics built in.
```

### Scope Justifications

```
boards:read — Required to retrieve the list of boards on the connected Pinterest Business account so users can select a target board when scheduling a Pin in GetPostFlow. Without this scope, users cannot assign a Pin to a board.

pins:read — Required to retrieve existing Pins from the connected account for content history display and analytics correlation within GetPostFlow.

pins:write — Required to create and publish Pins to the connected Pinterest Business account via the pins.create endpoint. This is the core Pinterest publishing capability of GetPostFlow.

user_accounts:read — Required to retrieve the authenticated user's Pinterest account information (username, profile) to display in the connected accounts panel in GetPostFlow.

ads:read — Required to retrieve Pin analytics (impressions, saves, clicks, engagement) from the Pinterest Analytics API to populate GetPostFlow's performance dashboards and generate client-ready reports.
```

### Demo Video Script

**Target length:** 3–4 minutes
**Format:** Screen recording with voiceover. Use a real Pinterest Business test account.

**[0:00–0:20] Introduction**
- State the app name, purpose, and what will be demonstrated.
- Show: GetPostFlow dashboard.

**[0:20–0:55] Connecting a Pinterest Business Account**
- Click "Connect Account" → select Pinterest.
- Walk through the Pinterest OAuth consent screen — narrate each scope.
- Show: Pinterest account appearing in the connected accounts list.

**[0:55–2:00] Scheduling and Publishing a Pin**
- Create a new Pin in the content composer.
- Select a board from the board list (pulled via `boards:read`).
- Upload an image, write a description and title.
- Set a scheduled date.
- Submit through the approval workflow → approve → transitions to scheduled.
- Show: Pin appearing on the test Pinterest board after publishing.

**[2:00–2:40] Analytics**
- Navigate to the Pinterest analytics panel.
- Show Pin impressions, saves, and click metrics.
- Narrate: "`ads:read` scope is used to retrieve these metrics."

**[2:40–3:15] Disconnect**
- Show disconnecting the Pinterest account from Settings.

**[3:15–3:30] Closing**
- Recap each scope and its direct use in the product.

---

## TODOs Requiring User Action

1. **Sign in with a Pinterest Business account** — personal accounts cannot access all required API scopes.
2. **Verify email address** on the Pinterest account before accessing the developer portal.
3. **Accept the Pinterest Developer Terms of Service** at https://developers.pinterest.com before creating the app.
4. **Verify scope name for analytics** — confirm `ads:read` is the correct scope for organic Pin analytics against https://developers.pinterest.com/docs/api/v5/ before submitting.
5. **Ensure the Privacy Policy at `https://getpostflow.vercel.app/privacy` explicitly references Pinterest data handling** — a generic policy is a rejection trigger.
6. **Create a Pinterest Business test account** with at least one board and several Pins before filming the demo video.
7. **Record the demo video** using the script above with a real Pinterest Business test account.
8. **Use Trial access tier** for development and integration testing before applying for full production access.
9. **Do not request `boards:write`** in the initial submission if board creation is not implemented in v1 — add it in a follow-on scope request.
10. **After Custom Domain cutover to `getpostflow.com`:** update the redirect URI to add `https://getpostflow.com/api/oauth/pinterest/callback` (exact match required) in the app's OAuth settings.
