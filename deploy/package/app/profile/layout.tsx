import { ProfileLayoutShell } from "@/components/profile/profile-layout-shell"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProfileLayoutShell>{children}</ProfileLayoutShell>
}
