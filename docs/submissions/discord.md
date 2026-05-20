# Discord Application + Bot Submission Packet
## GetPostFlow

---

## App Identity

| Field | Value |
|---|---|
| **Application Name** | GetPostFlow |
| **App Type** | Discord Application + Bot |
| **Bot Username** | GetPostFlow#0000 (assign during bot creation) |
| **Primary Use Case** | Community inbox management, scheduled announcements, and moderation assistance for Discord servers |
| **Target User Type** | Small business owners and community managers who run Discord servers as part of their brand presence |

---

## Tagline

> Manage your Discord community from GetPostFlow — schedule announcements, monitor channels, and respond with AI-assisted suggestions.

*(138 characters)*

---

## Long Description

*(Discord application description field — under 400 characters for bot listing; extend in the support page/website)*

GetPostFlow connects to Discord servers as an authorized bot to enable community managers to schedule and publish announcements, monitor channel messages for the unified inbox, and draft AI-assisted replies — all with human approval before any message is sent. GetPostFlow never auto-responds in Discord without explicit approval.

**Extended description for support documentation:**

GetPostFlow is an AI-powered social media management platform for small and medium-sized businesses. The Discord integration extends GetPostFlow's unified inbox and content scheduling capabilities to Discord servers where a business maintains a community presence.

**What GetPostFlow does with Discord access:**

- **Announcement scheduling:** Team members create Discord announcements in GetPostFlow's content calendar and schedule them for specific channels in connected Discord servers. The bot posts the message at the scheduled time via the Discord API.
- **Channel monitoring:** The GetPostFlow bot reads messages in designated channels (channels the bot has been granted access to) to surface relevant community messages in the unified inbox.
- **AI-assisted reply drafting:** GetPostFlow's AI suggests response drafts for incoming Discord messages. All suggested replies require human approval before the bot posts them. There is no automatic unprompted reply from the bot.
- **Moderation assistance:** Surface flagged messages or rule-violation signals for review by the server's moderation team within GetPostFlow.
- **OAuth server connection:** Discord server admins authorize GetPostFlow by adding the bot to their server via Discord's OAuth2 Add to Server flow.

GetPostFlow does **not** read DMs between server members, does not scrape message history beyond what is needed to populate the inbox, and does not take any moderation action (kick, ban, mute) without explicit human initiation.

---

## Required Bot Permissions

| Permission | Justification |
|---|---|
| `Send Messages` | Required to post scheduled announcements and human-approved replies in designated channels. This is the core Discord publishing capability. |
| `Read Message History` | Required to retrieve recent messages in monitored channels so the unified inbox can surface them for team review. |
| `View Channels` | Required to read the list of channels in the connected server so users can select which channels to monitor or publish to in GetPostFlow. |
| `Embed Links` | Required to send rich-embed formatted announcements (structured content with title, description, images) that are commonly used for business announcements. |
| `Attach Files` | Required to send image or media attachments as part of scheduled announcement posts. |
| `Add Reactions` | Required if GetPostFlow offers reaction-based engagement tracking or acknowledgment features (optional — can be deferred). |
| `Manage Messages` | Required only if moderation assistance (deleting flagged messages) is included — request separately if needed. **Do not include in initial bot invite scope if moderation is not in v1.** |

> **Note on permission minimalism:** Request only permissions required for implemented v1 features. `Manage Messages`, `Kick Members`, `Ban Members`, and `Manage Roles` should **not** be requested unless moderation actions are explicitly built and demonstrated.

### Bot Invite URL (OAuth2 Scopes)

Discord bot invite links use OAuth2 scopes `bot` and `applications.commands`.

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=PERMISSION_INTEGER&scope=bot%20applications.commands
```

> **TODO:** Replace `YOUR_CLIENT_ID` with the actual Discord Application Client ID after app creation in the Discord Developer Portal. Calculate `PERMISSION_INTEGER` from the selected permissions using Discord's permission calculator at https://discordapi.com/permissions.html

---

## OAuth2 Redirect URIs

```
https://getpostflow.vercel.app/api/oauth/discord/callback
```

---

## Privacy Policy & Terms of Service

| Document | URL |
|---|---|
| Privacy Policy | `https://getpostflow.vercel.app/privacy` |
| Terms of Service | `https://getpostflow.vercel.app/terms` |

---

## Discord App Directory Listing (If Applying)

Discord's App Directory listing requires additional assets and a listing description.

**Short description (max 100 characters):**
> AI-assisted Discord community management for businesses.

**Long description (max 10,000 characters):**
See the "Long Description" section above for full text. Supplement with screenshots and feature bullets aligned to Discord's App Directory format requirements.

> **TODO:** Decide whether to list in the Discord App Directory at launch. The App Directory requires a verified bot, a clear support server, and compliance with Discord's App Directory policy. This can be a post-launch milestone if preferred.

---

## Demo Video Script

**Target length:** 3–4 minutes
**Format:** Screen recording with voiceover. Use a real Discord test server.

### Outline

**[0:00–0:20] Introduction**
- State the app name, purpose, and what the video will demonstrate.
- Show: GetPostFlow dashboard.

**[0:20–0:55] Adding GetPostFlow Bot to a Discord Server**
- Show the Discord OAuth2 bot invite flow in GetPostFlow.
- Walk through the server selection and permission grant screen.
- Show: GetPostFlow bot appearing in the server's member list.
- Show: Connected server appearing in GetPostFlow's connected accounts panel.

**[0:55–1:45] Scheduling an Announcement**
- Create a new announcement post in GetPostFlow's content calendar.
- Select the target Discord server and channel.
- Write the announcement content.
- Set a scheduled date and time.
- Walk through the approval workflow → approve → transitions to scheduled.
- Show: announcement message appearing in the Discord channel at the scheduled time.

**[1:45–2:20] Community Inbox — Monitoring Messages**
- Show a message in the monitored Discord channel appearing in GetPostFlow's unified inbox.
- Narrate: "Read Message History permission is used to surface these messages."

**[2:20–3:00] AI-Assisted Reply Drafting**
- Show the AI suggesting a reply draft for the Discord message.
- **Explicitly demonstrate the approval gate** — the reply does NOT send automatically.
- Approve the reply → it appears in the Discord channel from the bot.
- Narrate: "No message is sent from the bot without explicit human approval."

**[3:00–3:20] Disconnect / Remove Bot**
- Show disconnecting the Discord server from GetPostFlow.
- Show: bot can be removed from the server via Discord's server settings.

**[3:20–3:40] Closing**
- Recap each permission and its direct purpose in the product.

---

## Screenshot List

1. **Discord bot invite screen** — permission list visible during OAuth add-to-server flow
2. **Connected Discord server** — server listed in GetPostFlow's accounts panel
3. **Content composer** — announcement text, channel selector, scheduled date
4. **Approval workflow** — announcement in "pending review" state
5. **Announcement posted** — message live in the test Discord channel
6. **Channel message in unified inbox** — Discord message surfaced in GetPostFlow
7. **AI reply suggestion** — draft with approval gate visible (no auto-send)
8. **Bot reply posted** — approved reply appearing in the Discord channel
9. **Disconnect server** — Settings page showing removal option

---

## Test Account / Reviewer Credentials

> **TODO (user action required):**
> 1. Create a Discord developer application at https://discord.com/developers/applications
> 2. Create a bot token for the GetPostFlow application.
> 3. Set up a test Discord server and add the GetPostFlow bot with the appropriate permissions.
> 4. Connect the test server to GetPostFlow staging.
> 5. If submitting for App Directory listing, provide Discord review with:
>    - Invite to a test Discord server where the bot is installed
>    - GetPostFlow staging login credentials
>    - URL of the staging environment
>    - Step-by-step instructions to reach the Discord connect flow

---

## Expected Review Window & Tips

**Expected window:** Discord OAuth apps do not require a formal approval process for basic bot use. **App Directory listing** requires review: typically **1–2 weeks** after submission. Discord's bot verification (for bots in 100+ servers) also requires a separate verification request.

### Tips to Avoid Common Rejection / Policy Issues

1. **Request minimum permissions.** Discord reviewers and server admins both inspect the permission list. Requesting `Administrator` permission is a major red flag — never request it.
2. **Privacy policy must address server data.** Discord's App Directory policy requires a published privacy policy covering message data collection.
3. **Bot must be stable and responsive** during the App Directory review. Reviewers test the bot live.
4. **Support server required for App Directory.** Create a GetPostFlow Discord server that the bot is in, and provide it as the support server URL.
5. **Verified bot required for 100+ servers.** Once GetPostFlow's bot grows beyond 100 servers, Discord requires bot verification via a form. Plan for this at scale.
6. **Do not DM server members unsolicited.** Discord's policy prohibits bots from initiating DMs to users without consent. GetPostFlow should only message in channels it has been granted access to.
7. **Slash commands require `applications.commands` scope.** If GetPostFlow adds slash commands (e.g., `/schedule`, `/inbox`) to the bot, ensure this scope is included in the invite URL.
8. **Intents:** If the bot needs to receive message content, enable the **Message Content privileged intent** in the Developer Portal. For servers over 100 members, this requires verification.

---

## Common Issues (Discord-Specific)

- Bot requesting `Administrator` permission — always rejected by cautious server admins
- Privacy policy not covering Discord message data
- Bot not responding during App Directory live review
- Message Content intent not enabled for message monitoring features
- Bot invite URL missing `applications.commands` scope for slash commands

---
