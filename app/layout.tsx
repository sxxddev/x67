import type { Metadata } from 'next'
import { Geist_Mono, Noto_Sans_Thai } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from '@/components/session-provider'
import { Preloader } from '@/components/preloader'
import { SiteAnnouncementModal } from '@/components/site-announcement-modal'
import { SiteBackground } from '@/components/site-background'
import { AuthModalHost } from '@/components/auth-modal-host'
import { PageTransition } from '@/components/page-transition'
import { SiteRouteOverlay } from '@/components/site-route-overlay'
import { AdminOnlyNextDevTools } from '@/components/admin-only-next-devtools'
import { buildSiteMetadata } from '@/lib/site-metadata'
import { getSiteSettings } from '@/lib/get-site-settings'
import './globals.css'

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-thai",
  display: "swap",
})
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings()
    return buildSiteMetadata({
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
    })
  } catch {
    return buildSiteMetadata()
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body
        className={`${notoSansThai.className} ${geistMono.variable} font-sans font-normal antialiased min-h-screen bg-black text-foreground`}
      >
        <SiteBackground />
        <SiteRouteOverlay />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <SessionProvider>
            <AdminOnlyNextDevTools />
            <Preloader />
            <SiteAnnouncementModal />
            <AuthModalHost />
            <div className="relative z-10">
              <PageTransition>{children}</PageTransition>
            </div>
          </SessionProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
