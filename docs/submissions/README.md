# Submissions Index
## GetPostFlow — Developer App Submission Packets

This directory contains developer app submission packets for all 7 platforms required for GetPostFlow's launch. Each packet is a self-contained document with everything needed to file the submission in the respective developer console.

---

## Live URLs

- **Production:** https://getpostflow.vercel.app
- **Privacy:** https://getpostflow.vercel.app/privacy
- **Terms:** https://getpostflow.vercel.app/terms
- **Health check:** https://getpostflow.vercel.app/api/health

> Custom domain (getpostflow.com) will be connected post-launch; OAuth redirects on the .vercel.app domain are sufficient for app review and can be expanded post-domain-cutover.

---

## Recommended Submission Order

Submit in this order — **longest review first** to minimize launch-blocking delays:

| Priority | Platform | Packet | Estimated Review Window | Risk Level |
|---|---|---|---|---|
| 1 | LinkedIn Marketing Developer Platform | [linkedin.md](./linkedin.md) | **2–8 weeks** | High |
| 2 | Meta (Facebook + Instagram) | [meta.md](./meta.md) | 1–3 weeks (advanced perms) | Medium-High |
| 3 | TikTok for Business / Marketing API | [tiktok.md](./tiktok.md) | 4–8 weeks | High |
| 4 | YouTube Data API v3 | [youtube.md](./youtube.md) | 3–6 weeks (security assessment) | Medium |
| 5 | Pinterest Business API | [pinterest.md](./pinterest.md) | 3–10 business days | Low-Medium |
| 6 | Reddit API | [reddit.md](./reddit.md) | Instant (standard); 1–3 weeks (elevated) | Low |
| 7 | Discord Application + Bot | [discord.md](./discord.md) | 1–2 weeks (App Directory only) | Low |

> **Note:** LinkedIn and TikTok are the two highest launch-blocking risks per the GetPostFlow Architecture Plan v3. LinkedIn must be submitted first and TikTok immediately after. These two should be submitted before significant app code is written (Phase 0).

> **Note:** Meta and YouTube can be submitted in parallel with LinkedIn/TikTok once app descriptions and demo environments are ready.

---

## Submission Status Tracking Table

Copy and maintain this table in your project management tool (Notion, Linear, GitHub Issues, etc.) to track live status.

| Platform | App / Client ID | Submission Date | Status | Reviewer Notes | Next Action |
|---|---|---|---|---|---|
| LinkedIn | `TODO` | — | Not submitted | — | Submit first |
| Meta | `TODO` | — | Not submitted | — | Submit after LinkedIn |
| TikTok | `TODO` | — | Not submitted | — | Submit in parallel with Meta |
| YouTube | `TODO` | — | Not submitted | — | Submit in parallel with Meta/TikTok |
| Pinterest | `TODO` | — | Not submitted | — | Submit after Meta/TikTok are in queue |
| Reddit | `TODO` | — | Not submitted | — | Submit any time; auto-approved |
| Discord | `TODO` | — | Not submitted | — | Submit any time; App Directory is optional at launch |

**Status values:** `Not submitted` → `Submitted` → `In review` → `Approved` → `Production live` / `Rejected — revising`

---

## Common Assets Required Across All Platforms

Prepare these assets **before** filing any submissions. Most platforms require several of these at submission time.

### Brand & Visual Assets

| Asset | Spec | Notes |
|---|---|---|
| App icon / logo — 1024×1024 px | PNG, transparent or white background | Used by Meta, Google, TikTok, Discord |
| App icon — 512×512 px | PNG | LinkedIn, Pinterest |
| App icon — 256×256 px | PNG | Reddit, Discord fallback |
| App icon — 128×128 px | PNG | Smaller display contexts |
| Banner / hero image — 1200×628 px | PNG or JPG | Meta app detail page, Discord App Directory |
| Square logo — 400×400 px | PNG | LinkedIn Company Page logo |

> **TODO:** Produce all icon sizes from the master GetPostFlow brand asset before any submission. Store in `/docs/assets/icons/`.

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

| Page | URL | Requirement |
|---|---|---|
| Privacy Policy | `https://getpostflow.vercel.app/privacy` | **All platforms** |
| Terms of Service | `https://getpostflow.vercel.app/terms` | Meta, LinkedIn, TikTok, Discord |

### Demo Environment

| Item | Notes |
|---|---|
| Production URL | `https://getpostflow.vercel.app` — live and functional; use for app review submissions |
| Test user accounts | One per platform, set up in advance (see TODO sections in each packet) |
| Test social accounts | One real account per platform connected to the GetPostFlow instance |
| Demo video | 3–5 min screen recording per platform (see scripts in each packet) |
| Demo video hosting | Upload to YouTube (unlisted) or Vimeo for submission URLs — most platforms accept URL links |

---

## Domain & OAuth Redirect Status

Production is live at `https://getpostflow.vercel.app`. All OAuth redirect URIs in the platform packets use this domain.

- All redirect URIs updated to: `https://getpostflow.vercel.app/api/oauth/<platform>/callback`
- Privacy and Terms pages are live at the `.vercel.app` URLs above
- Custom domain (`getpostflow.com`) will be connected post-launch; update OAuth redirect URIs in each developer console after domain cutover

> **TODO:** Re-verify domain ownership in Google Search Console, LinkedIn, and Pinterest developer portals once `getpostflow.com` is connected.
> **TODO:** After domain cutover, add `https://getpostflow.com/api/oauth/<platform>/callback` as an additional redirect URI in each developer console (keep the `.vercel.app` URI active in parallel during transition).

---

## Platform-Specific Developer Console URLs

| Platform | Console URL |
|---|---|
| Meta | https://developers.facebook.com/ |
| TikTok | https://developers.tiktok.com/ |
| Google / YouTube | https://console.cloud.google.com/ |
| LinkedIn | https://developer.linkedin.com/ |
| Pinterest | https://developers.pinterest.com/ |
| Reddit | https://www.reddit.com/prefs/apps |
| Discord | https://discord.com/developers/applications |

---

## Packet Authorship Note

These packets were generated as complete submission-ready drafts based on the GetPostFlow Architecture Plan v3. All `TODO` items in each packet require human action by the filing user before submission.
