import type { Metadata } from "next"
import { SITE_OG_DISPLAY_NAME } from "@/lib/brand"

export const SITE_OG_TAGLINE = "No.1 Gaming Services & Scripts"

export const SITE_OG_DESCRIPTION =
  "เลือกสิ่งที่ดีที่สุดให้กับการเล่นเกมของคุณ กับ X67SECRETME ร้านค้าที่เกมเมอร์ไว้วางใจ สินค้าอัปเดตใหม่ล่าสุดเสมอ"

export type SiteMetadataInput = {
  siteName?: string
  siteDescription?: string | null
}

export function getSiteUrl(): URL {
  const raw =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw)
}

export function buildSiteTitle(_siteName?: string): string {
  return `${SITE_OG_DISPLAY_NAME} | ${SITE_OG_TAGLINE}`
}

export function buildSiteMetadata(input?: SiteMetadataInput): Metadata {
  const siteUrl = getSiteUrl()
  const description = input?.siteDescription?.trim() || SITE_OG_DESCRIPTION
  const title = buildSiteTitle()

  const ogImage = {
    url: "/og-banner.png",
    width: 1200,
    height: 630,
    alt: title,
    type: "image/png" as const,
  }

  return {
    metadataBase: siteUrl,
    title: {
      default: title,
      template: `%s | ${SITE_OG_DISPLAY_NAME}`,
    },
    description,
    icons: {
      icon: "/logo-transparent.png",
      apple: "/logo-transparent.png",
    },
    openGraph: {
      type: "website",
      locale: "th_TH",
      url: siteUrl,
      siteName: SITE_OG_DISPLAY_NAME,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-banner.png"],
    },
  }
}
