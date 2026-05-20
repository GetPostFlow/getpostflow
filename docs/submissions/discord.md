# Discord — Submission Playbook
<!-- Source: https://discord.com/developers/docs -->

---

## Console URL

https://discord.com/developers/applications

---

## Prerequisites

- A Discord account (this account becomes the app owner/developer)
- App icon prepared: 512×512 px PNG recommended
- Privacy Policy live at `https://getpostflow.vercel.app/privacy` — must cover Discord message data collection
- Terms of Service live at `https://getpostflow.vercel.app/terms`
- A test Discord server with the GetPostFlow bot installed (required for App Directory listing review)
- GetPostFlow staging environment functional

---

## Step-by-Step

### Step 1: Create the App / Account Setup

1. Navigate to **https://discord.com/developers/applications**.
2. Sign in with your Discord account if prompted.
3. Click **"New Application"** in the top-right corner.
4. Enter the application name: `GetPostFlow`.
5. Check the box to acknowledge the Discord Developer Terms of Service and Developer Policy.
6. Click **"Create"**.

---

### Step 2: Configure Basic Info

You land on the **General Information** page of the new application.

1. Fill in:
   - **Name:** `GetPostFlow` (should already be set)
   - **Description:** paste the short description from the Paste-Ready Content Block (under 400 characters for bot listing display)
   - **App Icon:** click the icon upload area → upload the 512×512 px PNG
   - **Privacy Policy URL:** `https://getpostflow.vercel.app/privacy`
   - **Terms of Service URL:** `https://getpostflow.vercel.app/terms`
2. Click **"Save Changes"**.
3. **Copy and save the Application ID** — shown on the General Information page. This is your bot's `client_id` and is used in the bot invite URL.
4. **Copy and save the Public Key** — also shown on the General Information page. Required for verifying interaction payloads.

---

### Step 3: Configure the Bot

1. In the left sidebar, click **"Bot"**.
2. Click **"Add Bot"** if a bot has not yet been created for this application (<!-- Verify in console: button labeled approximately "Add Bot" — if the bot was auto-created on app creation, this step may already be complete -->).
3. Click **"Reset Token"** → confirm the action → copy the bot token and store it securely in your secrets manager. **This token grants full bot access — treat it like a password.**
4. Configure **Privileged Gateway Intents**:
   - **Message Content Intent:** toggle **ON** if the bot needs to read the content of messages in monitored channels. Required for GetPostFlow's channel monitoring / unified inbox feature.
     > **Note:** For bots in 100+ servers, enabling Message Content Intent requires Discord bot verification via a separate form. Plan for this at scale.
   - **Server Members Intent:** toggle ON only if GetPostFlow needs to enumerate server members (not required for v1).
   - **Presence Intent:** leave OFF — GetPostFlow does not need presence data.
5. Under **Authorization Flow**:
   - **Public Bot:** set to **ON** if server admins should be able to add the bot independently via the invite URL; set to **OFF** if invite is controlled through GetPostFlow's OAuth flow only.
6. Click **"Save Changes"**.

---

### Step 4: Configure Installation Settings

1. In the left sidebar, click **"Installation"**.
2. Under **"Installation Contexts"**:
   - Enable **"Guild Install"** — GetPostFlow's bot is installed at the server (guild) level, not as a user app.
   - <!-- Verify in console: checkbox or toggle labeled approximately "Guild Install" under Installation Contexts -->
3. Under **"Default Install Settings"** → **"Guild"**:
   - **Scopes:** add `bot` and `applications.commands`
   - **Bot Permissions:** select the permissions listed in Step 5 below
4. The **Install Link** shown on this page (or the OAuth2 URL generator output) is the bot invite URL. Copy it after configuring permissions.
5. Click **"Save Changes"**.

---

### Step 5: Request Products / Add Permissions / Add Scopes

**Critical step.** GetPostFlow requires the following bot permissions. These are set in the Installation page (Default Install Settings) and encoded in the bot invite URL.

#### OAuth2 Scopes

| Scope | Why GetPostFlow Needs It |
|---|---|
| `bot` | Required to authorize the bot to join a Discord server and use bot-level capabilities (send messages, read channels, etc.). |
| `applications.commands` | Required to register and use slash commands (e.g., `/schedule`, `/inbox`) in servers where GetPostFlow is installed. |

#### Bot Permissions

| Permission | Permission Integer | Why GetPostFlow Needs It |
|---|---|---|
| View Channels | 1024 | Required to read the list of channels in the connected server so users can select which channels to monitor or publish to in GetPostFlow. |
| Send Messages | 2048 | Required to post scheduled announcements and human-approved replies in designated channels. Core Discord publishing capability. |
| Embed Links | 16384 | Required to send rich-embed formatted announcements (structured content with title, description, images). |
| Read Message History | 65536 | Required to retrieve recent messages in monitored channels so the unified inbox can surface them for team review. |
| Attach Files | 32768 | Required to send image or media attachments as part of scheduled announcement posts. |

**Permission integer calculation for v1:**

```
View Channels:        1024
Send Messages:        2048
Embed Links:         16384
Read Message History: 65536
Attach Files:        32768
                    ------
Total (v1):         117760
```

> **Permission calculator:** https://discordapi.com/permissions.html — paste `117760` to verify the selected permissions.

> **Note on permission minimalism:** Do **not** request `Administrator`, `Manage Messages`, `Kick Members`, `Ban Members`, or `Manage Roles` in v1. These are rejected by cautious server admins and are not required for the core announcement and inbox features.

---

### Step 6: OAuth / Redirect Configuration

1. In the left sidebar, click **"OAuth2"**.
2. Under the **"Redirects"** section, click **"Add Redirect"** → paste:

```
https://getpostflow.vercel.app/api/oauth/discord/callback
```

3. Click **"Save Changes"**.
4. Navigate to the **"URL Generator"** subtab (<!-- Verify in console: subtab labeled approximately "URL Generator" under OAuth2 in the left sidebar -->):
   - Select scopes: `bot` and `applications.commands`
   - Select bot permissions: View Channels, Send Messages, Embed Links, Read Message History, Attach Files
   - The generated URL at the bottom of the page is your bot invite URL
5. The bot invite URL format is:

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=117760&scope=bot%20applications.commands
```

Replace `YOUR_APPLICATION_ID` with your actual Application ID (copied from General Information in Step 2).

---

### Step 7: Submit for Review (App Directory — Optional)

**Basic bot use does not require a formal review.** Server admins can add the bot via the invite URL immediately.

**App Directory listing** (optional at launch) requires a separate submission:

1. Navigate to **https://discord.com/developers/applications** → select your app → click the **"App Directory"** tab (<!-- Verify in console: tab labeled approximately "App Directory" in the left sidebar of your application page -->).
2. Fill in:
   - Short description (max 100 characters): `AI-assisted Discord community management for businesses.`
   - Long description: see Paste-Ready Content Block
   - Screenshots and promotional assets
   - Support server URL (a GetPostFlow Discord server where the bot is installed)
   - Privacy Policy URL: `https://getpostflow.vercel.app/privacy`
   - Terms of Service URL: `https://getpostflow.vercel.app/terms`
3. Click **"Submit for Review"** (<!-- Verify in console: button labeled approximately "Submit for Review" or "Submit Listing" -->).

**Demo video requirements:**
- Length: 3–4 minutes
- Format: screen recording with voiceover
- Use a real Discord test server
- Must demonstrate every permission being used
- See Demo Video Script in Paste-Ready Content Block

**Screenshot list:**
1. Discord bot invite screen — permission list visible during OAuth add-to-server flow
2. Connected Discord server — server listed in GetPostFlow's accounts panel
3. Content composer — announcement text, channel selector, scheduled date
4. Approval workflow — announcement in "pending review" state
5. Announcement posted — message live in the test Discord channel
6. Channel message in unified inbox — Discord message surfaced in GetPostFlow
7. AI reply suggestion — draft with approval gate visible (no auto-send)
8. Bot reply posted — approved reply appearing in the Discord channel
9. Disconnect server — Settings page showing removal option

**Test credentials:**

> **TODO (user action required):**
> 1. Create a Discord developer application at https://discord.com/developers/applications.
> 2. Generate and securely store a bot token for the GetPostFlow application.
> 3. Set up a test Discord server and add the GetPostFlow bot with the appropriate permissions.
> 4. Connect the test server to GetPostFlow staging.
> 5. If submitting for App Directory listing, provide Discord review with:
>    - Invite to a test Discord server where the bot is installed
>    - GetPostFlow staging login credentials
>    - URL of the staging environment
>    - Step-by-step instructions to reach the Discord connect flow

---

### Step 8: Wait for Approval

- **Basic bot use:** No review required — immediate.
- **App Directory listing:** **1–2 weeks** after submission.
- **Bot verification (100+ servers):** Separate process — submit a verification request through the Discord developer portal once the bot reaches this scale.
- **Where to track App Directory status:** App Directory tab in your application page — status shows pending/approved.

**Common rejection / policy issues:**
- Bot requesting `Administrator` permission — always rejected by cautious server admins; never request it
- Privacy policy not covering Discord message data
- Bot not responding during App Directory live review — ensure staging is stable
- Message Content Intent not enabled for message monitoring features
- Bot invite URL missing `applications.commands` scope for slash commands

---

## Paste-Ready Content Block

### Application Name
```
GetPostFlow
```

### Short Description (under 400 characters — for bot listing)

```
GetPostFlow connects to Discord servers as an authorized bot to enable community managers to schedule and publish announcements, monitor channel messages for the unified inbox, and draft AI-assisted replies — all with human approval before any message is sent. GetPostFlow never auto-responds in Discord without explicit approval.
```

### App Directory Short Description (max 100 characters)
```
AI-assisted Discord community management for businesses.
```

### Long Description (for App Directory listing and support documentation)

```
GetPostFlow is an AI-powered social media management platform for small and medium-sized businesses. The Discord integration extends GetPostFlow's unified inbox and content scheduling capabilities to Discord servers where a business maintains a community presence.

What GetPostFlow does with Discord access:

- Announcement scheduling: Team members create Discord announcements in GetPostFlow's content calendar and schedule them for specific channels in connected Discord servers. The bot posts the message at the scheduled time via the Discord API.
- Channel monitoring: The GetPostFlow bot reads messages in designated channels (channels the bot has been granted access to) to surface relevant community messages in the unified inbox.
- AI-assisted reply drafting: GetPostFlow's AI suggests response drafts for incoming Discord messages. All suggested replies require human approval before the bot posts them. There is no automatic unprompted reply from the bot.
- Moderation assistance: Surface flagged messages or rule-violation signals for review by the server's moderation team within GetPostFlow.
- OAuth server connection: Discord server admins authorize GetPostFlow by adding the bot to their server via Discord's OAuth2 Add to Server flow.

GetPostFlow does not read DMs between server members, does not scrape message history beyond what is needed to populate the inbox, and does not take any moderation action (kick, ban, mute) without explicit human initiation.
```

### Tagline (138 characters)
```
Manage your Discord community from GetPostFlow — schedule announcements, monitor channels, and respond with AI-assisted suggestions.
```

### Bot Invite URL (replace APPLICATION_ID)
```
https://discord.com/api/oauth2/authorize?client_id=APPLICATION_ID&permissions=117760&scope=bot%20applications.commands
```

### Permission Integer Breakdown
```
View Channels:         1024
Send Messages:         2048
Embed Links:          16384
Read Message History: 65536
Attach Files:         32768
─────────────────────────────
Total (v1):          117760
```

### Demo Video Script

**Target length:** 3–4 minutes
**Format:** Screen recording with voiceover. Use a real Discord test server.

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

## TODOs Requiring User Action

1. **Create the Discord developer application** at https://discord.com/developers/applications.
2. **Generate and securely store the bot token** via Bot → Reset Token — treat this like a password; never commit it to source control.
3. **Copy and record the Application ID** from the General Information page — needed to construct the bot invite URL.
4. **Enable Message Content Intent** in Bot → Privileged Gateway Intents if the channel monitoring / unified inbox feature reads message content.
5. **Decide on Public Bot setting** — ON if admins invite independently; OFF if invite is gated through GetPostFlow's OAuth flow.
6. **Create a GetPostFlow Discord support server** (required for App Directory listing) — add the bot to it and provide the server invite URL in the App Directory submission.
7. **Produce the 512×512 px app icon PNG** for the General Information page.
8. **Ensure the Privacy Policy at `https://getpostflow.vercel.app/privacy` covers Discord message data collection** — App Directory policy requires this explicitly.
9. **Calculate and verify the permission integer** using https://discordapi.com/permissions.html before deploying the invite URL — confirm it equals `117760` for v1 permissions.
10. **Plan for bot verification** at 100+ servers — Discord requires a separate verification request when the bot scales beyond 100 servers; Message Content Intent also requires verification at that scale.
11. **Decide whether to submit for App Directory** at launch or defer it as a post-launch milestone.
12. **After Custom Domain cutover to `getpostflow.com`:** add `https://getpostflow.com/api/oauth/discord/callback` as an additional redirect URI in OAuth2 settings.
