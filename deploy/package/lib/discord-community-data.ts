export type DiscordWidgetMember = {
  id: string
  username: string
  status: string
  avatar_url?: string
  activity?: { name?: string }
}

export type DiscordCommunityPayload = {
  ok: true
  source: "widget" | "bot"
  name: string
  inviteUrl: string
  onlineCount: number
  memberCount?: number
  iconUrl?: string | null
  members: DiscordWidgetMember[]
  /** online = จาก Widget (คนออนไลน์จริง), roster = จาก Bot (รายชื่อในเซิร์ฟ) */
  memberListMode?: "online" | "roster"
}

export type DiscordCommunityError = {
  ok: false
  error: string
  needsBot?: boolean
  botInviteUrl?: string
  hint?: string
  message?: string
}

export function guildIconUrl(guildId: string, icon: string | null) {
  if (!icon) return null
  const ext = icon.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.${ext}?size=128`
}

export function botInviteUrl(clientId: string) {
  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=0&scope=bot`
}

export function memberAvatarUrl(userId: string, avatar: string | null) {
  if (!avatar) {
    return `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(userId) % 6n)}.png`
  }
  const ext = avatar.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${ext}?size=64`
}

/** รายชื่อสมาชิกผ่าน Bot (ต้องเปิด Server Members Intent ใน Developer Portal) */
export async function fetchGuildMembersViaBot(
  serverId: string,
  botToken: string,
  limit = 50
) {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${serverId}/members?limit=${Math.min(limit, 100)}`,
    {
      headers: { Authorization: `Bot ${botToken.trim()}` },
      next: { revalidate: 120 },
    }
  )

  if (res.status === 403) {
    return { ok: false as const, needMembersIntent: true }
  }

  if (!res.ok) {
    return { ok: false as const, status: res.status }
  }

  const rows = (await res.json()) as Array<{
    user: {
      id: string
      username: string
      global_name?: string | null
      avatar?: string | null
    }
    nick?: string | null
  }>

  const members: DiscordWidgetMember[] = rows.map((row, index) => ({
    id: row.user.id,
    username:
      row.nick?.trim() ||
      row.user.global_name?.trim() ||
      row.user.username,
    status: index < 15 ? "online" : "idle",
    avatar_url: memberAvatarUrl(row.user.id, row.user.avatar ?? null),
  }))

  return { ok: true as const, members }
}

/** ดึง widget.json (ต้องเปิด Widget ใน Discord) */
export async function fetchDiscordWidgetJson(serverId: string) {
  const res = await fetch(
    `https://discord.com/api/guilds/${serverId}/widget.json`,
    { next: { revalidate: 60 } }
  )

  const data = (await res.json().catch(() => ({}))) as {
    message?: string
    code?: number
    id?: string
    name?: string
    instant_invite?: string
    presence_count?: number
    members?: DiscordWidgetMember[]
  }

  if (!res.ok) {
    const disabled =
      data.code === 50004 ||
      (data.message && /widget|วิดเจ็ต/i.test(data.message))
    return { ok: false as const, disabled }
  }

  return {
    ok: true as const,
    name: data.name || "Discord",
    inviteUrl: data.instant_invite,
    onlineCount: data.presence_count ?? 0,
    members: (data.members ?? []).slice(0, 100),
    memberListMode: "online" as const,
  }
}

/** ดึงจำนวนสมาชิก/ออนไลน์ผ่าน Bot — ไม่ต้องเปิด Server Widget */
export async function fetchDiscordGuildViaBot(
  serverId: string,
  botToken: string
) {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${serverId}?with_counts=true`,
    {
      headers: { Authorization: `Bot ${botToken.trim()}` },
      next: { revalidate: 60 },
    }
  )

  if (!res.ok) {
    return { ok: false as const, status: res.status }
  }

  const data = (await res.json()) as {
    id: string
    name: string
    icon: string | null
    approximate_member_count?: number
    approximate_presence_count?: number
  }

  return {
    ok: true as const,
    id: data.id,
    name: data.name,
    icon: data.icon,
    memberCount: data.approximate_member_count ?? 0,
    onlineCount: data.approximate_presence_count ?? 0,
  }
}
