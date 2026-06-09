"use client"

import { BrandLogo } from "@/components/brand-logo"
import { TransitionLink } from "@/components/transition-link"
import { SITE_BRAND_NAME } from "@/lib/brand"
import { Package, Wallet, Store } from "lucide-react"
import { DiscordCommunity } from "@/components/discord-community"

const DISCORD_URL =
  process.env.NEXT_PUBLIC_DISCORD_TICKET_URL ?? "https://discord.com"

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/50 py-16 text-white/70 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="flex flex-col space-y-4">
            <TransitionLink
              href="/"
              className="flex w-fit items-center gap-2.5 rounded-lg transition-opacity hover:opacity-90"
            >
              <BrandLogo width={36} height={36} className="h-9 w-9 shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-white">{SITE_BRAND_NAME}</h2>
                <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-white/60">
                  <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  ONLINE
                </div>
              </div>
            </TransitionLink>
            <p className="max-w-sm text-sm leading-relaxed">
              ร้านค้าจำหน่ายสินค้าดิจิทัลออนไลน์ พร้อมระบบเติมเงินที่สะดวกและรวดเร็ว ส่งสินค้าอัตโนมัติทันที
            </p>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              ติดต่อเรา
            </a>
          </div>

          <div className="flex flex-col space-y-4">
            <h3 className="premium-accent-line text-sm font-bold uppercase tracking-widest text-white">
              เมนู
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <TransitionLink href="/" className="transition-colors hover:text-white">
                  หน้าหลัก
                </TransitionLink>
              </li>
              <li>
                <TransitionLink href="/store" className="transition-colors hover:text-white">
                  ร้านค้า
                </TransitionLink>
              </li>
              <li>
                <TransitionLink href="/topup" className="flex items-center gap-2 transition-colors hover:text-white">
                  <Wallet className="h-4 w-4" />
                  เติมเงิน
                </TransitionLink>
              </li>
              <li>
                <TransitionLink href="/store" className="flex items-center gap-2 transition-colors hover:text-white">
                  <Package className="h-4 w-4" />
                  สินค้าทั้งหมด
                </TransitionLink>
              </li>
            </ul>
          </div>

          <div className="flex w-full max-w-[350px] flex-col space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              ชุมชน DISCORD
            </h3>
            {process.env.NEXT_PUBLIC_DISCORD_SERVER_ID ? (
              <DiscordCommunity />
            ) : (
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-glass flex min-h-[200px] flex-col items-center justify-center p-6 text-center text-sm text-white/60 transition hover:text-white"
              >
                ตั้งค่า NEXT_PUBLIC_DISCORD_SERVER_ID ใน .env เพื่อแสดงชุมชน Discord
              </a>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-white/10 pt-8 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} {SITE_BRAND_NAME}. All Rights Reserved.</p>
          <div className="mt-4 flex space-x-6 md:mt-0">
            <TransitionLink href="/terms" className="transition-colors hover:text-white">
              ข้อตกลงและเงื่อนไข
            </TransitionLink>
            <TransitionLink href="/privacy" className="transition-colors hover:text-white">
              นโยบายความเป็นส่วนตัว
            </TransitionLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
