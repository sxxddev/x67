import { prisma } from "@/lib/prisma"
import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_ID } from "@/lib/site-settings-defaults"

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: SITE_SETTINGS_ID },
  })
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: DEFAULT_SITE_SETTINGS,
    })
  }
  return settings
}
