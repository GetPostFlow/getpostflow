# LinkedIn Marketing Developer Platform Submission Packet
## GetPostFlow

> **Risk flag:** LinkedIn has the **longest expected review window** in this submission set: **2–8 weeks** per LinkedIn's documented timelines. This is also a high approval risk. Submit this packet **first**, before all other platforms, in Phase 0.

---

## App Identity

| Field | Value |
|---|---|
| **App Name** | GetPostFlow |
| **Company / Organization** | GetPostFlow (must match verified LinkedIn Company Page) |
| **App Type** | Marketing Developer Platform |
| **Products to Apply For** | Sign In with LinkedIn using OpenID Connect, Share on LinkedIn, LinkedIn Marketing APIs (Community Management API, Content API, Organization APIs) |
| **Primary Use Case** | Third-party social media management and publishing platform for SMBs |

---

## Tagline

> AI-powered social media management for SMBs — schedule, publish, and analyze LinkedIn content with structured client approval workflows.

*(150 characters)*

---

## Long Description

*(LinkedIn's application description and use case field — under 2,000 characters recommended; supplement with a detailed use-case document if requested)*

GetPostFlow is an AI-powered social media management platform for small and medium-sized businesses and the agencies managing their brand presence. GetPostFlow connects to LinkedIn Organization pages on behalf of authorized users to enable content publishing, post analytics, and — where available under the approved API tier — comment and engagement management within a structured human-approval workflow.

**What GetPostFlow does with LinkedIn access:**

- **Organization page publishing:** GetPostFlow enables authorized team members to create, schedule, and publish text posts, images, documents, and videos to LinkedIn Organization (Company) pages. Every piece of content passes through an internal review and optional client approval workflow before any publish action is taken. GetPostFlow uses the LinkedIn Content API (`ugcPosts` / `posts` endpoints) for publishing.
- **Post analytics:** Retrieve organization post and page analytics (impressions, clicks, engagement, follower statistics) to populate performance dashboards and client-ready reports.
- **Comment management (if approved under Community Management API):** Surface comments on organization posts in the GetPostFlow unified inbox. Replies are drafted by team members and always require human approval before posting.
- **OAuth account management:** Users authenticate their LinkedIn accounts via the standard OAuth 2.0 flow with OpenID Connect. Tokens are encrypted at rest and refreshed proactively.

GetPostFlow does **not** post to personal LinkedIn profiles. It operates exclusively on LinkedIn Organization (Company) pages where the authenticated user has the appropriate page admin permissions.

---

## Requested Scopes / Permissions

| Scope | Justification |
|---|---|
| `openid` | Required by LinkedIn's OpenID Connect (Sign In with LinkedIn) to obtain the authenticated user's identity token. |
| `profile` | Required to retrieve the authenticated user's name and profile photo for display within GetPostFlow's account management UI. |
| `email` | Required to associate the LinkedIn OAuth session with the user's GetPostFlow account record. |
| `w_member_social` | Required to post content to LinkedIn on behalf of the authenticated member/organization page admin. This enables the core LinkedIn publishing capability. |
| `r_organization_social` | Required to read organization posts and organization analytics on behalf of the page admin to populate analytics dashboards. |
| `w_organization_social` | Required to post content to LinkedIn Organization (Company) pages on behalf of the authenticated page admin. This is the primary publishing scope for organization pages. |
| `r_organization_admin` | Required to read the list of organization pages the authenticated user administers, so GetPostFlow can display the correct pages in the connected accounts selector. |
| `rw_organization_admin` | Required if comment management (Community Management API) is approved — allows read/write access to organization page comments for inbox and reply workflows. |
| `r_analytics` (or `r_ads_reporting`) | Required to retrieve LinkedIn analytics data for organization pages (impressions, engagement, follower stats) to populate GetPostFlow's reporting dashboards. |

> **TODO:** LinkedIn's exact scope names differ between legacy v1 and the current LinkedIn Marketing APIs. Verify against the current API documentation at https://learn.microsoft.com/en-us/linkedin/marketing/ before final submission. If Community Management API is a separate product application, submit it as a follow-on after core publishing is approved.

---

## Redirect URIs

```
https://staging.getpostflow.com/api/oauth/linkedin/callback
```

> **TODO (replace before production submission):** Add the production URI:
> ```
> https://getpostflow.com/api/oauth/linkedin/callback
> ```

---

## Privacy Policy & Terms of Service

| Document | URL |
|---|---|
| Privacy Policy | `https://staging.getpostflow.com/privacy` |
| Terms of Service | `https://staging.getpostflow.com/terms` |

> **TODO:** Replace `staging.getpostflow.com` with the production domain. LinkedIn's review requires a publicly accessible privacy policy that explicitly covers LinkedIn platform data collection, storage, use, and user data deletion.

---

## Use Case Explanation Document

*(LinkedIn often requests a supplemental written use case document. This section is the draft.)*

**Application Name:** GetPostFlow  
**Use Case Category:** Social Media Management / Content Publishing Tool

**Summary:**
GetPostFlow is a managed social media platform that enables SMB marketing teams and agencies to plan, generate, approve, schedule, and publish content to LinkedIn Organization pages at scale. The platform provides structured approval workflows, client-facing content review portals, post analytics, and AI-assisted content generation. All LinkedIn interactions (publishing and replies) go through human approval before any action is executed on the platform.

**Detailed Use Case:**

1. A small business authenticates their LinkedIn Organization page admin account via OAuth. GetPostFlow reads their list of managed pages (`r_organization_admin`).
2. A marketing team member creates a post in GetPostFlow's content calendar — text, image, or video — and assigns it to the LinkedIn page.
3. The post goes through an internal review step, then optionally a client approval step in the client portal.
4. Upon approval, the post is scheduled. GetPostFlow's worker publishes it to LinkedIn at the scheduled time using `w_organization_social`.
5. Analytics are retrieved after publishing to show post impressions, engagement, and click data (`r_organization_social` / `r_analytics`).
6. If Community Management API access is approved: comments on the organization post appear in GetPostFlow's unified inbox. A team member drafts a reply, which goes through approval before posting.

**Data Handling:**
- LinkedIn data is used only to render it back to the same authorized user/organization within GetPostFlow.
- No LinkedIn data is shared with third parties.
- Tokens are encrypted at rest. Users can disconnect their LinkedIn account at any time.
- Data is retained only for the duration of the user's active GetPostFlow subscription.

---

## Demo Video Script (Required)

**Target length:** 3–5 minutes
**Format:** Screen recording with voiceover. Use a real LinkedIn Company Page test account.

### Outline

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

**[2:30–3:00] Comment Inbox (if Community Management API is being applied for)**
- Show a comment on the LinkedIn post appearing in the GetPostFlow inbox.
- Draft a reply, approve it, post it.
- Show: reply appearing on the LinkedIn post.

**[3:00–3:30] Disconnect**
- Show disconnecting the LinkedIn account and token revocation.

**[3:30–4:00] Closing**
- Recap each scope used and its specific purpose.
- Confirm no personal profile posts are made; all actions are on Organization pages.

---

## Screenshot List

1. **LinkedIn OAuth consent screen** — scopes visible
2. **Connected Organization page** — page listed in GetPostFlow's accounts panel
3. **Content composer** — post with text, image, and scheduled date
4. **Approval workflow** — content in review state
5. **Published LinkedIn post** — live on test Organization page
6. **Analytics dashboard** — LinkedIn impressions and engagement metrics
7. **Comment in inbox** — LinkedIn comment surfaced in GetPostFlow (if applicable)
8. **Reply approval** — reply draft with approve/edit controls
9. **Disconnect account** — Settings page with revocation option

---

## Test Account / Reviewer Credentials

> **TODO (user action required):**
> 1. Create a dedicated LinkedIn Developer App at https://developer.linkedin.com/
> 2. Associate the app with a verified LinkedIn Company Page for GetPostFlow.
> 3. Create a test LinkedIn user account that is an admin of a test Company page.
> 4. Provide LinkedIn review team with:
>    - LinkedIn test user credentials (email + password)
>    - GetPostFlow staging login credentials
>    - URL of the staging environment
>    - Step-by-step instructions to reach the LinkedIn OAuth connect flow in GetPostFlow

---

## Expected Review Window & Tips

**Expected window: 2–8 weeks.** LinkedIn's Marketing Developer Platform review is the longest in this submission set. Plan for a 6-week buffer and submit **before all other platforms**.

### Tips to Avoid Common Rejections

1. **Create a LinkedIn Company Page for GetPostFlow first.** The app must be associated with a verified company. A personal developer account without a company page will be rejected.
2. **Apply for products individually.** LinkedIn has separate product approvals (Sign In with LinkedIn, Share on LinkedIn, Marketing APIs). Start with Sign In + Share, then apply for Community Management as a separate follow-on.
3. **Provide the supplemental use-case document.** LinkedIn reviewers expect a written description beyond what fits in the app description field. Use the "Use Case Explanation" section above.
4. **Do not apply for analytics scopes unless your analytics dashboard is fully built.** Requesting scopes for unimplemented features is a rejection signal.
5. **Privacy policy must explicitly reference LinkedIn data.** Generic policies are rejected.
6. **Your app's domain and privacy/TOS URLs must be live** — LinkedIn reviewers check them.
7. **Demo video must show real LinkedIn content** — not placeholder or "lorem ipsum" posts.
8. **The app review team may reach out via email** — watch the developer account email for reviewer questions and respond within 48 hours to avoid the review timing out.
9. **If rejected, the feedback often identifies missing scope justification.** Reapply with a revised, more detailed written use case rather than just resubmitting the same materials.

---

## Common Rejection Reasons (LinkedIn-Specific)

- App not associated with a verified LinkedIn Company Page
- Privacy policy missing LinkedIn data reference
- Scope justification too vague
- Requesting Community Management API without a clear, live inbox implementation shown
- Analytics scope requested without a functional analytics dashboard shown in the video
- Reviewer email questions left unanswered → review timeout
- Use-case document not included for Marketing API products

---
