# Submissions Index
## GetPostFlow — Developer App Submission Playbooks

This directory contains complete developer app submission playbooks for all 7 platforms required for GetPostFlow's launch. Each file is a self-contained, click-by-click guide with everything needed to file the submission in the respective developer console.

---

## Live URLs

- **Production:** https://getpostflow.vercel.app
- **Privacy Policy:** https://getpostflow.vercel.app/privacy
- **Terms of Service:** https://getpostflow.vercel.app/terms
- **Health check:** https://getpostflow.vercel.app/api/health

> Custom domain (`getpostflow.com`) will be connected post-launch. OAuth redirects on the `.vercel.app` domain are sufficient for app review and can be expanded after domain cutover.

---

## Recommended Submission Order

Submit in this order — **longest review first** to minimize launch-blocking delays:

| Priority | Platform | Playbook | Estimated Review Window | Risk Level | Rationale |
|---|---|---|---|---|---|
| 1 | LinkedIn Marketing Developer Platform | [linkedin.md](./linkedin.md) | **2–8 weeks** | High | Longest window in the set; Standard Tier requires two-tier approval process. Submit before any other platform. |
| 2 | TikTok for Business / Content Posting API | [tiktok.md](./tiktok.md) | **4–8 weeks** | High | Strictest approval in the set; business verification required; scope demo scrutiny is intense. Submit immediately after LinkedIn. |
| 3 | Meta (Facebook + Instagram) | [meta.md](./meta.md) | **1–3 weeks** (advanced perms) | Medium-High | Business Verification required; advanced permissions (messages, engagement) take up to 3 weeks. Can run in parallel with TikTok. |
| 4 | YouTube Data API v3 | [youtube.md](./youtube.md) | **3–6 weeks** (restricted scopes + CASA) | Medium | Restricted scopes (`youtube`, `youtube.upload`) may trigger CASA Tier 2 security assessment. Can run in parallel with Meta. |
| 5 | Pinterest Business API | [pinterest.md](./pinterest.md) | **3–10 business days** | Low-Medium | Straightforward process; Trial access available immediately for development. Submit after Meta/TikTok are in queue. |
| 6 | Reddit API | [reddit.md](./reddit.md) | **Instant** (standard); 1–3 weeks (elevated) | Low | Standard OAuth access is auto-granted on app creation. Submit any time; elevated access request can wait until the integration is built. |
| 7 | Discord Application + Bot | [discord.md](./discord.md) | **No review** (basic bot); 1–2 weeks (App Directory) | Low | No review required for basic bot deployment. App Directory listing is optional at launch. |

> **Note:** LinkedIn and TikTok are the two highest launch-blocking risks. Both must be submitted in Phase 0 — before significant app code is written. Meta and YouTube can be submitted in parallel once demo environments are ready.

---

## Submission Status Tracking Table

Update this table as submissions progress. Copy into Notion, Linear, or GitHub Issues for live tracking.

| Platform | App / Client ID | Submission Date | Status | Reviewer Notes | Approval Date |
|---|---|---|---|---|---|
| LinkedIn | `TODO` | — | Not submitted | — | — |
| Meta | `TODO` | — | Not submitted | — | — |
| TikTok | `TODO` | — | Not submitted | — | — |
| YouTube | `TODO` | — | Not submitted | — | — |
| Pinterest | `TODO` | — | Not submitted | — | — |
| Reddit | `TODO` | — | Not submitted | — | — |
| Discord | `TODO` | — | Not submitted | — | — |

**Status values:** `Not submitted` → `Submitted` → `In review` → `Approved` → `Production live` / `Rejected — revising`

---

## Pre-Submission Assets Checklist

Prepare these assets **once**, before filing any submission. Most platforms require several of these at submission time.

### Icon Files — Prepare All Sizes

| File | Dimensions | Format | Used By |
|---|---|---|---|
| `icon-1024.png` | 1024×1024 px | PNG | Meta, Google/YouTube, TikTok, Discord (fallback) |
| `icon-512.png` | 512×512 px | PNG | LinkedIn, Discord (recommended) |
| `icon-256.png` | 256×256 px | PNG | Reddit, Discord fallback |
| `icon-128.png` | 128×128 px | PNG | Smaller display contexts |

> **TODO (user action required):** Export all icon sizes from the master GetPostFlow brand asset before any submission. Store in `/docs/assets/icons/`.

### Additional Visual Assets

| Asset | Dimensions | Format | Used By |
|---|---|---|---|
| Banner / hero image | 1200×628 px | PNG or JPG | Meta app detail page, Discord App Directory |
| Square logo | 400×400 px | PNG | LinkedIn Company Page logo |

### Demo Videos — Record Per Platform

| Platform | Target Length | Format | Script Location |
|---|---|---|---|
| LinkedIn | 3–5 min | Screen recording + voiceover | [linkedin.md → Paste-Ready Content Block](./linkedin.md) |
| Meta | 3–5 min | Screen recording + voiceover | [meta.md → Paste-Ready Content Block](./meta.md) |
| TikTok | 3–5 min | Screen recording + voiceover; 1–5 files, max 50 MB each | [tiktok.md → Paste-Ready Content Block](./tiktok.md) |
| YouTube | 3–5 min | Screen recording + voiceover; upload unlisted to YouTube/Vimeo | [youtube.md → Paste-Ready Content Block](./youtube.md) |
| Pinterest | 3–4 min | Screen recording + voiceover | [pinterest.md → Paste-Ready Content Block](./pinterest.md) |
| Reddit | 3–4 min | Screen recording + voiceover (for elevated access request only) | [reddit.md → Paste-Ready Content Block](./reddit.md) |
| Discord | 3–4 min | Screen recording + voiceover (for App Directory listing only) | [discord.md → Paste-Ready Content Block](./discord.md) |

### Business Verification Documents

Most platforms (Meta, LinkedIn, TikTok) require business verification before granting advanced permissions. Prepare:

| Document | Required By | Notes |
|---|---|---|
| Business registration / incorporation certificate | Meta, LinkedIn, TikTok | Government-issued; must match company name on developer account |
| Business address proof | Meta (optional but speeds approval) | Utility bill or bank statement |
| Domain ownership verification | Google (YouTube), Pinterest, LinkedIn | Verify domain in respective Search Console / developer portals |
| Linked company social profiles | LinkedIn, TikTok | LinkedIn Company Page and TikTok Business account for GetPostFlow |
| Tax ID / EIN (if US-based) | LinkedIn elevated access (sometimes) | Have on hand; may be requested |

### Privacy & Legal Pages

| Page | URL | Required By |
|---|---|---|
| Privacy Policy | `https://getpostflow.vercel.app/privacy` | **All platforms** |
| Terms of Service | `https://getpostflow.vercel.app/terms` | Meta, LinkedIn, TikTok, Discord |

> **TODO (user action required):** Before any submission, verify that the Privacy Policy explicitly mentions each platform's data by name (LinkedIn data, Meta Platform Data, TikTok Platform Data, Google API data, Pinterest data, Reddit data, Discord message data). Generic policies are rejected by LinkedIn, Meta, TikTok, and Google.

---

## Cross-Platform OAuth Redirect URIs

All redirect URIs follow the pattern `https://getpostflow.vercel.app/api/oauth/<platform>/callback`.

| Platform | Redirect URI | Where to Configure |
|---|---|---|
| LinkedIn | `https://getpostflow.vercel.app/api/oauth/linkedin/callback` | LinkedIn Developer Portal → App → Auth tab → Authorized redirect URLs |
| Meta | `https://getpostflow.vercel.app/api/oauth/meta/callback` | Meta Developer Portal → Facebook Login for Business → Valid OAuth Redirect URIs |
| TikTok | `https://getpostflow.vercel.app/api/oauth/tiktok/callback` | TikTok Developer Portal → App → Login Kit → Redirect URI |
| YouTube | `https://getpostflow.vercel.app/api/oauth/youtube/callback` | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID → Authorized redirect URIs |
| Pinterest | `https://getpostflow.vercel.app/api/oauth/pinterest/callback` | Pinterest Developer Portal → App → Redirect URIs (exact match required) |
| Reddit | `https://getpostflow.vercel.app/api/oauth/reddit/callback` | Reddit → reddit.com/prefs/apps → edit app → redirect uri |
| Discord | `https://getpostflow.vercel.app/api/oauth/discord/callback` | Discord Developer Portal → Application → OAuth2 → Redirects |

> **After Custom Domain cutover:** Add `https://getpostflow.com/api/oauth/<platform>/callback` as an additional redirect URI in each developer console. Keep the `.vercel.app` URI active in parallel during the transition period.

---

## Platform Console URLs Quick Reference

| Platform | Console URL |
|---|---|
| LinkedIn | https://www.linkedin.com/developers/apps |
| Meta / Facebook | https://developers.facebook.com |
| TikTok | https://developers.tiktok.com |
| Google / YouTube | https://console.cloud.google.com |
| Pinterest | https://developers.pinterest.com |
| Reddit | https://www.reddit.com/prefs/apps |
| Discord | https://discord.com/developers/applications |
| Reddit (modern docs) | https://developers.reddit.com/docs |
| Discord permission calculator | https://discordapi.com/permissions.html |

---

## Domain & OAuth Redirect Status

Production is live at `https://getpostflow.vercel.app`. All OAuth redirect URIs in the platform playbooks use this domain.

- All redirect URIs use: `https://getpostflow.vercel.app/api/oauth/<platform>/callback`
- Privacy Policy is live at: `https://getpostflow.vercel.app/privacy`
- Terms of Service is live at: `https://getpostflow.vercel.app/terms`
- Custom domain (`getpostflow.com`) will be connected post-launch

> **TODO:** Re-verify domain ownership in Google Search Console, LinkedIn developer portal, and Pinterest developer portal once `getpostflow.com` is connected.
> **TODO:** After domain cutover, add `https://getpostflow.com/api/oauth/<platform>/callback` as an additional redirect URI in each developer console (keep the `.vercel.app` URI active in parallel during transition).

---

## Packet Authorship Note

These playbooks are complete submission-ready guides based on the GetPostFlow Architecture Plan v3 and verified platform documentation. All `TODO` items in each playbook require human action by the filing user before submission.
