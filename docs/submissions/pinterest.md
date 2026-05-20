# Pinterest Business API Submission Packet
## GetPostFlow

---

## App Identity

| Field | Value |
|---|---|
| **App Name** | GetPostFlow |
| **App Type** | Business |
| **API Version** | Pinterest API v5 |
| **Primary Use Case** | Social media management — Pin scheduling, publishing, board management, and analytics for SMB businesses |

---

## Tagline

> Plan, schedule, and publish Pins to Pinterest — with AI-assisted content creation and performance analytics built in.

*(120 characters)*

---

## Long Description

*(Pinterest app description field — recommended under 2,000 characters)*

GetPostFlow is an AI-powered social media management platform for small and medium-sized businesses and the agencies managing their brand presence. GetPostFlow integrates with the Pinterest API v5 to enable end-users to schedule and publish Pins, manage boards, and retrieve analytics — all within a structured approval workflow.

**What GetPostFlow does with Pinterest access:**

- **Pin publishing:** Create and schedule Pins (image and video) to boards on the connected Pinterest Business account. GetPostFlow uses the `pins.create` endpoint to publish scheduled content. Content passes through internal review and optional client approval before publishing.
- **Board management:** Read the list of boards available on the connected account so users can select the target board when creating a Pin.
- **Analytics:** Retrieve Pin and account-level analytics (impressions, saves, clicks, engagement) for performance dashboards and client reports.
- **OAuth account management:** Users authenticate via Pinterest OAuth 2.0. Tokens are encrypted at rest and refreshed proactively.

GetPostFlow operates exclusively on Pinterest Business accounts. It does not access personal Pinterest accounts.

---

## Requested Scopes / Permissions

| Scope | Justification |
|---|---|
| `boards:read` | Required to retrieve the list of boards on the connected Pinterest Business account so users can select a target board when scheduling a Pin in GetPostFlow. |
| `boards:write` | Required if GetPostFlow needs to create new boards on behalf of users (optional feature — can be deferred to a later scope request if not in v1). |
| `pins:read` | Required to retrieve existing Pins from the connected account for content history display and analytics correlation within GetPostFlow. |
| `pins:write` | Required to create and publish Pins to the connected Pinterest Business account. This is the core Pinterest publishing capability. |
| `user_accounts:read` | Required to retrieve the authenticated user's Pinterest account information (username, profile) to display in the connected accounts panel. |
| `ads:read` | Required to retrieve Pin analytics (impressions, saves, clicks, engagement) from the Pinterest Analytics API to populate GetPostFlow's performance dashboards. |

> **TODO:** Verify scope names against the current Pinterest API v5 reference at https://developers.pinterest.com/docs/api/v5/ — confirm `ads:read` is the correct scope for organic pin analytics or if a different scope applies.

---

## Redirect URIs

```
https://getpostflow.vercel.app/api/oauth/pinterest/callback
```

---

## Privacy Policy & Terms of Service

| Document | URL |
|---|---|
| Privacy Policy | `https://getpostflow.vercel.app/privacy` |
| Terms of Service | `https://getpostflow.vercel.app/terms` |

---

## Demo Video Script

**Target length:** 3–4 minutes
**Format:** Screen recording with voiceover. Use a real Pinterest Business test account.

### Outline

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

## Screenshot List

1. **Pinterest OAuth consent screen** — scopes visible during authorization
2. **Connected Pinterest account** — account listed in GetPostFlow
3. **Content composer** — Pin title, description, image, board selector, schedule
4. **Board selector populated** — boards list from `boards:read`
5. **Approval workflow** — Pin in review state
6. **Published Pin** — live on test Pinterest board
7. **Analytics dashboard** — Pinterest Pin and account metrics
8. **Disconnect account** — Settings page with revocation option

---

## Test Account / Reviewer Credentials

> **TODO (user action required):**
> 1. Create a Pinterest developer app at https://developers.pinterest.com/
> 2. Set up a Pinterest Business test account with at least one board and a few Pins.
> 3. Connect the test account to GetPostFlow staging.
> 4. Provide the Pinterest review process with:
>    - Pinterest Business account credentials
>    - GetPostFlow staging login credentials
>    - URL of the staging environment
>    - Step-by-step instructions to reach the Pinterest OAuth connect flow

---

## Expected Review Window & Tips

**Expected window:** Pinterest API v5 approval for standard scopes is typically **3–10 business days**. Pinterest's process is more straightforward than LinkedIn or TikTok, but the app and domain must be verified.

### Tips to Avoid Common Rejections

1. **Register your app with a live, publicly accessible domain.** Pinterest validates the app URL.
2. **Use Pinterest API v5** — do not reference or use the deprecated v1/v3 endpoints in any way.
3. **Privacy policy must be live and reference Pinterest data** before submitting.
4. **Show every scope in the demo video.** Unused scopes are rejection triggers.
5. **Do not request `boards:write` in the initial submission** if board creation is not implemented — request it in a follow-on scope review.
6. **Verify analytics scope access.** Pinterest's analytics access model for non-Ads accounts can differ. If organic analytics access requires a separate business application, note this and apply accordingly.
7. **Pinterest Business account verification** — ensure the test account is a Business account, not a personal account. Some scopes are only available to Business accounts.

---

## Common Rejection Reasons (Pinterest-Specific)

- App domain not live or returns errors
- Scopes requested but not demonstrated
- Privacy policy missing or not referencing Pinterest data
- Using deprecated API version endpoints
- Personal account used instead of Business account

---
