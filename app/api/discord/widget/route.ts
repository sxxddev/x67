import { NextResponse } from "next/server"
import {
  botInviteUrl,
  fetchDiscordGuildViaBot,
  fetchDiscordWidgetJson,
  fetchGuildMembersViaBot,
  guildIconUrl,
  type DiscordCommunityPayload,
} from "@/lib/discord-community-data"

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
}

export async function GET() {
  const serverId = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID?.trim()
  const inviteFallback =
    process.env.NEXT_PUBLIC_DISCORD_TICKET_URL?.trim() ||
    "https://discord.com"
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim()
  const botClientId = process.env.DISCORD_BOT_CLIENT_ID?.trim()

  if (!serverId) {
    return NextResponse.json(
      { ok: false, error: "missing_server_id" },
      { status: 400 }
    )
  }

  try {
    const widget = await fetchDiscordWidgetJson(serverId)

    if (widget.ok) {
      const payload: DiscordCommunityPayload = {
        ok: true,
        source: "widget",
        name: widget.name,
        inviteUrl: widget.inviteUrl || inviteFallback,
        onlineCount: widget.onlineCount,
        members: widget.members,
        memberListMode: "online",
      }
      return NextResponse.json(payload, { headers: CACHE_HEADERS })
    }

    if (botToken) {
      const guild = await fetchDiscordGuildViaBot(serverId, botToken)

      if (guild.ok) {
        const memberFetch = await fetchGuildMembersViaBot(
          serverId,
          botToken,
          30
        )

        const payload: DiscordCommunityPayload = {
          ok: true,
          source: "bot",
          name: guild.name,
          inviteUrl: inviteFallback,
          onlineCount: guild.onlineCount,
          memberCount: guild.memberCount,
          iconUrl: guildIconUrl(guild.id, guild.icon),
          members: memberFetch.ok ? memberFetch.members : [],
          memberListMode: memberFetch.ok ? "roster" : undefined,
        }
        return NextResponse.json(payload, { headers: CACHE_HEADERS })
      }

      return NextResponse.json(
        {
          ok: false,
          error: "bot_failed",
          needsBot: true,
          botInviteUrl: botClientId ? botInviteUrl(botClientId) : undefined,
          hint:
            guild.status === 401
              ? "token_invalid"
              : guild.status === 403
                ? "bot_no_access"
                : guild.status === 404
                  ? "wrong_server_id_or_bot_not_in_server"
                  : "bot_unknown",
        },
        { status: 200, headers: CACHE_HEADERS }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        error: "needs_bot",
        needsBot: true,
        botInviteUrl: botClientId ? botInviteUrl(botClientId) : undefined,
        hint: "missing_bot_token",
        message: widget.disabled
          ? "widget_disabled"
          : "widget_and_bot_unavailable",
      },
      { status: 200, headers: CACHE_HEADERS }
    )
  } catch (e) {
    console.error("Discord community API error:", e)
    return NextResponse.json(
      { ok: false, error: "network_error" },
      { status: 200 }
    )
  }
}
