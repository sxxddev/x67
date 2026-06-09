"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  DiscordCommunityError,
  DiscordCommunityPayload,
  DiscordWidgetMember,
} from "@/lib/discord-community-data"

const DISCORD_URL =
  process.env.NEXT_PUBLIC_DISCORD_TICKET_URL ?? "https://discord.com"

function DiscordLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
      />
    </svg>
  )
}

function statusDotClass(status: string) {
  if (status === "online") return "bg-[#23a559]"
  if (status === "idle") return "bg-[#f0b232]"
  if (status === "dnd") return "bg-[#f23f43]"
  return "bg-[#80848e]"
}

const WIDGET_SHELL =
  "mx-auto w-full max-w-[350px] overflow-hidden rounded-[5px] border border-[#1e1f22] shadow-[0_1px_2px_rgba(0,0,0,0.2)]"

function MemberRow({ member }: { member: DiscordWidgetMember }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-[3px]">
      <div className="relative h-7 w-7 shrink-0">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5865f2] text-[10px] font-medium text-white">
            {member.username.charAt(0).toUpperCase()}
          </div>
        )}
        <span
          className={cn(
            "absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-[#2b2d31]",
            statusDotClass(member.status)
          )}
        />
      </div>
      <span className="truncate text-[13px] leading-tight text-[#dbdee1]">
        {member.username}
      </span>
    </div>
  )
}

/** UI แบบ Discord Widget อย่างเป็นทางการ (ภาพตัวอย่าง) */
function DiscordWidgetCard({ data }: { data: DiscordCommunityPayload }) {
  const displayMembers =
    data.members.length > 0
      ? data.members
      : []

  const onlineLabel = `${data.onlineCount.toLocaleString("en-US")} Members Online`

  return (
    <a
      href={data.inviteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        WIDGET_SHELL,
        "block font-[gg_sans,'Noto_Sans',Helvetica,Arial,sans-serif] transition-opacity hover:opacity-[0.98]"
      )}
    >
      <div className="flex h-10 items-center gap-2 bg-[#5865f2] px-3">
        <DiscordLogo className="h-[18px] w-[18px] shrink-0 text-white" />
        <span className="text-[13px] font-semibold text-white">Discord</span>
        <span className="ml-auto truncate text-[11px] font-medium text-white/95">
          {onlineLabel}
        </span>
      </div>

      <div className="bg-[#2b2d31]">
        <p className="px-2.5 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wide text-[#949ba4]">
          Members Online
        </p>

        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden pb-1.5 [scrollbar-color:#1a1b1e_#2b2d31] [scrollbar-width:thin]">
          {displayMembers.length > 0 ? (
            displayMembers.map((m) => <MemberRow key={m.id} member={m} />)
          ) : (
            <div className="px-3 py-8 text-center">
              <p className="text-xs text-[#949ba4]">ยังไม่มีสมาชิกออนไลน์</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#1e1f22] bg-[#232428] px-3 py-2">
        <p className="text-center text-[10px] leading-snug text-[#949ba4]">
          Hangout with people who get it
        </p>
      </div>
    </a>
  )
}

const HINT_MESSAGES: Record<string, string> = {
  missing_bot_token:
    "ยังไม่พบ DISCORD_BOT_TOKEN ใน .env — ลบเครื่องหมาย # หน้าบรรทัด แล้ววาง Token จริง จากนั้นรีสตาร์ท npm run dev",
  token_invalid:
    "Bot Token ไม่ถูกต้อง — ไป Developer Portal → Bot → Reset Token แล้ววางใหม่ใน .env",
  bot_not_in_server:
    "Bot ยังไม่อยู่ในเซิร์ฟเวอร์ — กดปุ่มเชิญ Bot ด้านล่าง แล้วเลือกเซิร์ฟเวอร์ความลับ | PROJECT",
  wrong_server_id_or_bot_not_in_server:
    "Server ID ไม่ตรง หรือ Bot ยังไม่ได้เข้าเซิร์ฟเวอร์ — คลิกขวาชื่อเซิร์ฟเวอร์ → คัดลอก ID เซิร์ฟเวอร์",
  bot_no_access: "Bot ไม่มีสิทธิ์ดูเซิร์ฟเวอร์ — เชิญ Bot ใหม่ด้วยบัญชีเจ้าของเซิร์ฟเวอร์",
}

function DiscordBotSetupCard({
  err,
}: {
  err: DiscordCommunityError & { hint?: string }
}) {
  const hintKey = err.hint || ""
  const hintMsg = HINT_MESSAGES[hintKey]

  return (
    <div
      className={cn(
        WIDGET_SHELL,
        "space-y-3 border-amber-500/25 bg-[#2b2d31] p-3"
      )}
    >
      <div className="flex items-start gap-2">
        <DiscordLogo className="mt-0.5 h-6 w-6 shrink-0 text-[#5865f2]" />
        <div>
          <p className="text-sm font-semibold text-white">
            ตั้งค่าชุมชน Discord แบบง่าย (ไม่ต้องหา Widget)
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#b5bac1]">
            Discord เวอร์ชันใหม่บางทีไม่มีเมนู Widget — ใช้ Bot แทนได้ ใช้เวลา ~3 นาที
          </p>
          {hintMsg ? (
            <p className="mt-2 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-xs text-red-200">
              {hintMsg}
            </p>
          ) : null}
        </div>
      </div>

      <ol className="space-y-2 text-xs text-[#dbdee1]">
        <li className="rounded-lg bg-black/25 px-3 py-2">
          <strong className="text-white">1.</strong> เปิด{" "}
          <a
            href="https://discord.com/developers/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00a8fc] underline"
          >
            discord.com/developers/applications
          </a>{" "}
          → New Application → ตั้งชื่อ → Bot → Reset Token → คัดลอก Token
        </li>
        <li className="rounded-lg bg-black/25 px-3 py-2">
          <strong className="text-white">2.</strong> ใส่ในไฟล์{" "}
          <code className="text-[#faa81a]">.env</code>:
          <pre className="mt-2 overflow-x-auto rounded bg-black/40 p-2 text-[10px] text-[#23a559]">
{`DISCORD_BOT_TOKEN="วาง-token-ตรงนี้"
DISCORD_BOT_CLIENT_ID="เลข Application ID"
# ห้ามมี # นำหน้า 2 บรรทัดนี้`}
          </pre>
        </li>
        <li className="rounded-lg bg-black/25 px-3 py-2">
          <strong className="text-white">3.</strong> กดเชิญ Bot เข้าเซิร์ฟเวอร์ (ต้องเป็นเจ้าของเซิร์ฟเวอร์)
        </li>
        <li className="rounded-lg bg-black/25 px-3 py-2">
          <strong className="text-white">4.</strong> รีสตาร์ท{" "}
          <code className="text-[#faa81a]">npm run dev</code> แล้วรีเฟรชหน้าเว็บ
        </li>
      </ol>

      {err.botInviteUrl ? (
        <a
          href={err.botInviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#5865f2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4752c4]"
        >
          เชิญ Bot เข้าเซิร์ฟเวอร์
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : (
        <p className="text-xs text-[#949ba4]">
          ใส่ <code className="text-[#faa81a]">DISCORD_BOT_CLIENT_ID</code> ใน .env
          เพื่อให้ปุ่มเชิญ Bot ทำงานอัตโนมัติ
        </p>
      )}

      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs text-[#00a8fc] hover:underline"
      >
        หรือเข้า Discord โดยตรง →
      </a>
    </div>
  )
}

export function DiscordCommunity() {
  const [data, setData] = useState<
    DiscordCommunityPayload | DiscordCommunityError | null
  >(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/discord/widget")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setData({ ok: false, error: "network_error" })
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) {
    return (
      <div
        className={cn(
          WIDGET_SHELL,
          "flex min-h-[200px] items-center justify-center bg-[#2b2d31]"
        )}
      >
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#5865f2]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#5865f2] [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#5865f2] [animation-delay:300ms]" />
        </div>
      </div>
    )
  }

  if (data.ok) {
    return <DiscordWidgetCard data={data} />
  }

  if (
    data.error === "needs_bot" ||
    data.error === "bot_failed" ||
    data.needsBot
  ) {
    return <DiscordBotSetupCard err={data} />
  }

  return (
    <div
      className={cn(
        WIDGET_SHELL,
        "p-3 text-center text-sm text-[#b5bac1]"
      )}
    >
      โหลดชุมชน Discord ไม่สำเร็จ — ลองรีเฟรชหน้าเว็บ
    </div>
  )
}
