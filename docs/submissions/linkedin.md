# LinkedIn — Submission Playbook
<!-- Source: https://learn.microsoft.com/en-us/linkedin/marketing/ -->

> **Risk flag:** LinkedIn has the **longest expected review window** in this submission set: **2–8 weeks** per LinkedIn's documented timelines. This is also a high approval risk. Submit this packet **first**, before all other platforms, in Phase 0.

---

## Console URL

https://www.linkedin.com/developers/apps

---

## Prerequisites

- A verified LinkedIn Company Page for GetPostFlow (must exist before creating the app)
- A LinkedIn user account that is an admin of that Company Page
- App logo prepared: 512×512 px PNG
- Privacy Policy live at `https://getpostflow.vercel.app/privacy`
- Terms of Service live at `https://getpostflow.vercel.app/terms`
- Demo environment (staging or production) functional and accessible to reviewers

---

## Step-by-Step

### Step 1: Create the App / Account Setup

1. Navigate to **https://www.linkedin.com/developers/apps**.
2. Sign in with the LinkedIn account that administers the GetPostFlow Company Page.
3. Click **"Create app"** (top-right button).
4. Fill in the app creation form:
   - **App name:** `GetPostFlow`
   - **LinkedIn Page:** search for and select the GetPostFlow LinkedIn Company Page — the page must already exist and you must be its admin
   - **App logo:** upload the 512×512 px PNG
   - **Legal agreement:** check the box to agree to LinkedIn's API Terms of Use
5. Click **"Create app"**.

> **TODO (user action required):** Create the GetPostFlow LinkedIn Company Page at https://www.linkedin.com/company/setup/new/ before attempting to create the developer app. The app creation form will reject a missing or unassociated page.

---

### Step 2: Configure Basic Info

1. After creation, you land on the app's **Settings** tab.
2. Note the **Client ID** displayed on the page — save it securely.
3. Click **"Auth"** tab → locate the **Client Secret** — click to reveal and save securely.
4. Verify app association: LinkedIn may notify the Company Page admin via LinkedIn Page notifications to confirm the app is associated with the page. Check LinkedIn Page admin notifications and approve if prompted.
   - <!-- Verify in console: button labeled approximately "Verify" or "Confirm association" in Page admin notifications -->
5. Return to the **Settings** tab:
   - Confirm **App name** shows `GetPostFlow`
   - Confirm **LinkedIn Page** shows the correct Company Page

---

### Step 3: Request Products / Add Permissions / Add Scopes

**Critical step.** Navigate to the **Products** tab in your app dashboard. For each product, click the product name to view it, then click **"Request access"**.

#### Product 1: Sign In with LinkedIn using OpenID Connect

- **Exact name:** `Sign In with LinkedIn using OpenID Connect`
- **Why GetPostFlow needs it:** Allows users to authenticate their LinkedIn identity via OAuth 2.0 + OpenID Connect, obtaining `openid`, `profile`, and `email` scopes to link their LinkedIn account to their GetPostFlow workspace.
- **Auto-approved or manual review:** **Self-serve / auto-approved.** Access is granted immediately upon clicking "Request access".
- **Scopes granted:** `openid`, `profile`, `email`

#### Product 2: Share on LinkedIn

- **Exact name:** `Share on LinkedIn`
- **Why GetPostFlow needs it:** Grants the `w_member_social` scope, enabling GetPostFlow to publish content to LinkedIn on behalf of the authenticated member/page admin. Required for the core LinkedIn publishing capability.
- **Auto-approved or manual review:** **Self-serve / auto-approved.** Access is granted immediately.
- **Scopes granted:** `w_member_social`

#### Product 3: Community Management API

- **Exact name:** `Community Management API`
- **Why GetPostFlow needs it:** Grants organization-level scopes required to read and write to LinkedIn Organization (Company) pages: `r_organization_social`, `w_organization_social`, `rw_organization_admin`, `r_organization_admin`. Required for publishing to Company pages, retrieving analytics, and managing comments in the unified inbox.
- **Auto-approved or manual review:** **Manual review — two-tier process:**
  - **Tier 1 (Development Tier):** Click "Request access" on the Products tab → LinkedIn reviews and grants Development Tier access. Wait for approval before proceeding.
  - **Tier 2 (Standard Tier):** After Development Tier is approved, navigate back to the Products tab → find the Standard Tier upgrade option for Community Management API → <!-- Verify in console: button labeled approximately "Apply for Standard Tier" or "Request upgrade" --> → complete the access form + upload screen recording demonstrating use cases + provide test credentials → submit.
- **Scopes granted:** `r_organization_social`, `w_organization_social`, `rw_organization_admin`, `r_organization_admin`

**After all products are approved, verify scopes on the Auth tab:**

Navigate to the **Auth** tab → scroll to the **OAuth 2.0 Scopes** section. Confirm all of the following are listed:

| Scope | Source Product |
|---|---|
| `openid` | Sign In with LinkedIn using OpenID Connect |
| `profile` | Sign In with LinkedIn using OpenID Connect |
| `email` | Sign In with LinkedIn using OpenID Connect |
| `w_member_social` | Share on LinkedIn |
| `r_organization_social` | Community Management API |
| `w_organization_social` | Community Management API |
| `rw_organization_admin` | Community Management API |
| `r_organization_admin` | Community Management API |

> **Note on analytics:** The `r_ads_reporting` scope is available via the Advertising API (a separate product). If GetPostFlow's analytics dashboard is fully built, apply for the Advertising API product on the Products tab. Do not apply before the analytics feature is live and demonstrable.

---

### Step 4: OAuth / Redirect Configuration

1. Navigate to the **Auth** tab.
2. Under **OAuth 2.0 settings**, locate the **Authorized redirect URLs for your app** field.
3. Click **"Add redirect URL"** (<!-- Verify in console: button labeled approximately "Add redirect URL" -->).
4. Paste the following URI exactly:

```
https://getpostflow.vercel.app/api/oauth/linkedin/callback
```

5. Click **"Update"** or **"Save"** to confirm.
6. Verify the URI appears in the list with no trailing slashes or extra characters.

---

### Step 5: Submit for Review

#### Development Tier (Community Management API)

1. After clicking "Request access" on the Products tab for Community Management API, LinkedIn will begin a Development Tier review automatically.
2. Watch the email address associated with your LinkedIn developer account for any questions from the review team. Respond within 48 hours.
3. <!-- Verify in console: status indicator labeled approximately "Pending", "In review", or "Approved" next to the product on the Products tab -->

#### Standard Tier Application (Community Management API)

Once Development Tier is approved:

1. Return to the **Products** tab.
2. Locate the Standard Tier upgrade for Community Management API.
3. <!-- Verify in console: button labeled approximately "Apply for Standard Tier access" or "Request Standard Tier" -->
4. Complete the access form with the following:

**Questionnaire answers** (paste-ready answers in the Content Block below):
- Describe your use case
- Describe how you use each scope
- Confirm data handling practices

**Demo video requirements:**
- Length: 3–5 minutes
- Format: screen recording with voiceover
- Must use a real LinkedIn Company Page test account (not mockups)
- Must demonstrate every scope being used
- See full Demo Video Script in the Paste-Ready Content Block below

**Screenshot list:**
1. LinkedIn OAuth consent screen — scopes visible
2. Connected Organization page — page listed in GetPostFlow's accounts panel
3. Content composer — post with text, image, and scheduled date
4. Approval workflow — content in review state
5. Published LinkedIn post — live on test Organization page
6. Analytics dashboard — LinkedIn impressions and engagement metrics
7. Comment in inbox — LinkedIn comment surfaced in GetPostFlow (if applicable)
8. Reply approval — reply draft with approve/edit controls
9. Disconnect account — Settings page with revocation option

**Test credentials:**

> **TODO (user action required):**
> 1. Create a dedicated LinkedIn developer app test user that is an admin of a test Company page.
> 2. Provide LinkedIn review team with:
>    - LinkedIn test user credentials (email + password)
>    - GetPostFlow staging login credentials
>    - URL of the staging environment
>    - Step-by-step instructions to reach the LinkedIn OAuth connect flow in GetPostFlow

5. Upload the screen recording (<!-- Verify in console: file upload field labeled approximately "Screen recording" or "Demo video" -->).
6. Click **"Submit"**.

---

### Step 6: Wait for Approval

- **Development Tier timeline:** Varies; typically days to a few weeks.
- **Standard Tier timeline:** **2–8 weeks** per LinkedIn's documented review window for Marketing APIs.
- **Where to track status:** Products tab in the LinkedIn Developer Portal — each product shows its current approval status next to its name. <!-- Verify in console: status badge labeled approximately "Pending", "Approved", "Active" -->
- **Email notifications:** LinkedIn sends status updates to the developer account email. Monitor this inbox throughout the review window.

**Common rejection reasons:**
- App not associated with a verified LinkedIn Company Page
- Privacy policy missing LinkedIn data reference
- Scope justification too vague
- Requesting Community Management API without a live inbox implementation shown in the video
- Analytics scope requested without a functional analytics dashboard in the demo
- Reviewer email questions left unanswered → review timeout
- Use-case document not included for Marketing API products

**If rejected:**
- LinkedIn's rejection feedback typically identifies which scope justification was insufficient.
- Revise the written use-case document and demo video to address the specific feedback.
- Resubmit via the Products tab — do not resubmit the same materials without revision.

---

## Paste-Ready Content Block

### App Name
```
GetPostFlow
```

### App Description / Use Case (for application fields)

```
GetPostFlow is an AI-powered social media management platform for small and medium-sized businesses and the agencies managing their brand presence. GetPostFlow connects to LinkedIn Organization pages on behalf of authorized users to enable content publishing, post analytics, and comment management within a structured human-approval workflow.

What GetPostFlow does with LinkedIn access:

- Organization page publishing: GetPostFlow enables authorized team members to create, schedule, and publish text posts, images, documents, and videos to LinkedIn Organization (Company) pages. Every piece of content passes through an internal review and optional client approval workflow before any publish action is taken.
- Post analytics: Retrieve organization post and page analytics (impressions, clicks, engagement, follower statistics) to populate performance dashboards and client-ready reports.
- Comment management (if approved under Community Management API): Surface comments on organization posts in the GetPostFlow unified inbox. Replies are drafted by team members and always require human approval before posting.
- OAuth account management: Users authenticate their LinkedIn accounts via the standard OAuth 2.0 flow with OpenID Connect. Tokens are encrypted at rest and refreshed proactively.

GetPostFlow does not post to personal LinkedIn profiles. It operates exclusively on LinkedIn Organization (Company) pages where the authenticated user has the appropriate page admin permissions.
```

### Tagline (150 characters)
```
AI-powered social media management for SMBs — schedule, publish, and analyze LinkedIn content with structured client approval workflows.
```

### Scope Justifications (for application form)

```
openid — Required by LinkedIn's OpenID Connect (Sign In with LinkedIn) to obtain the authenticated user's identity token.

profile — Required to retrieve the authenticated user's name and profile photo for display within GetPostFlow's account management UI.

email — Required to associate the LinkedIn OAuth session with the user's GetPostFlow account record.

w_member_social — Required to post content to LinkedIn on behalf of the authenticated member/organization page admin. This enables the core LinkedIn publishing capability.

r_organization_social — Required to read organization posts and organization analytics on behalf of the page admin to populate analytics dashboards.

w_organization_social — Required to post content to LinkedIn Organization (Company) pages on behalf of the authenticated page admin. This is the primary publishing scope for organization pages.

r_organization_admin — Required to read the list of organization pages the authenticated user administers, so GetPostFlow can display the correct pages in the connected accounts selector.

rw_organization_admin — Required for comment management (Community Management API) — allows read/write access to organization page comments for inbox and reply workflows.
```

### Use Case Explanation Document

```
Application Name: GetPostFlow
Use Case Category: Social Media Management / Content Publishing Tool

Summary:
GetPostFlow is a managed social media platform that enables SMB marketing teams and agencies to plan, generate, approve, schedule, and publish content to LinkedIn Organization pages at scale. The platform provides structured approval workflows, client-facing content review portals, post analytics, and AI-assisted content generation. All LinkedIn interactions (publishing and replies) go through human approval before any action is executed on the platform.

Detailed Use Case:

1. A small business authenticates their LinkedIn Organization page admin account via OAuth. GetPostFlow reads their list of managed pages (r_organization_admin).
2. A marketing team member creates a post in GetPostFlow's content calendar — text, image, or video — and assigns it to the LinkedIn page.
3. The post goes through an internal review step, then optionally a client approval step in the client portal.
4. Upon approval, the post is scheduled. GetPostFlow's worker publishes it to LinkedIn at the scheduled time using w_organization_social.
5. Analytics are retrieved after publishing to show post impressions, engagement, and click data (r_organization_social).
6. If Community Management API access is approved: comments on the organization post appear in GetPostFlow's unified inbox. A team member drafts a reply, which goes through approval before posting.

Data Handling:
- LinkedIn data is used only to render it back to the same authorized user/organization within GetPostFlow.
- No LinkedIn data is shared with third parties.
- Tokens are encrypted at rest. Users can disconnect their LinkedIn account at any time.
- Data is retained only for the duration of the user's active GetPostFlow subscription.
```

### Demo Video Script

**Target length:** 3–5 minutes
**Format:** Screen recording with voiceover. Use a real LinkedIn Company Page test account.

**[0:00–0:20] Introduction**
- State the app name, category (social media management), and what the video will demonstrate.
- Show: GetPostFlow dashboard.

**[0:20–1:00] Connecting a LinkedIn Organization Page**
- Click "Connect Account" → select LinkedIn.
- Walk through the LinkedIn OAuth consent screen — narrate each permission.
- Show: Organization page appearing in the connected accounts list.

**[1:00–2:00] Creating and Publishing a LinkedIn Post**
- Create a post with text and an image in the content composer.
- Assign to the test LinkedIn Organization page.
- Set scheduled date.
- Walk through the approval workflow.
- Mark approved → transitions to scheduled.
- Show: post published live on the test LinkedIn page.

**[2:00–2:30] Analytics**
- Navigate to the LinkedIn analytics panel.
- Show impressions, engagement metrics populated from the analytics scope.

**[2:30–3:00] Comment Inbox (for Community Management API application)**
- Show a comment on the LinkedIn post appearing in the GetPostFlow inbox.
- Draft a reply, approve it, post it.
- Show: reply appearing on the LinkedIn post.

**[3:00–3:30] Disconnect**
- Show disconnecting the LinkedIn account and token revocation.

**[3:30–4:00] Closing**
- Recap each scope used and its specific purpose.
- Confirm no personal profile posts are made; all actions are on Organization pages.

---

## TODOs Requiring User Action

1. **Create the GetPostFlow LinkedIn Company Page** at https://www.linkedin.com/company/setup/new/ before creating the developer app. The page must exist and be verified.
2. **Produce the 512×512 px PNG app logo** and store it in `/docs/assets/icons/` before submitting.
3. **Verify that the Privacy Policy at `https://getpostflow.vercel.app/privacy` explicitly references LinkedIn data handling** — a generic policy is a rejection trigger.
4. **Create a dedicated test LinkedIn user account** that is an admin of a separate test Company page for use as reviewer credentials.
5. **Record the demo video** using the script above with a real LinkedIn Company Page test account — not mockups.
6. **Register a LinkedIn user agent contact account** and update the user agent string if required.
7. **Monitor the developer account email** throughout the review window — unanswered reviewer questions cause review timeout.
8. **After Custom Domain cutover to `getpostflow.com`:** add `https://getpostflow.com/api/oauth/linkedin/callback` as an additional redirect URI in the Auth tab.
9. **Verify `r_analytics` / `r_ads_reporting` scope availability** against current LinkedIn Marketing API docs at https://learn.microsoft.com/en-us/linkedin/marketing/ before applying for the Advertising API product.
