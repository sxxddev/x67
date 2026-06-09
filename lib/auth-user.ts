import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getAuthUserId() {
  const session = await auth()
  if (!session?.user) return null

  const sessionUser = session.user as {
    userId?: number
    username?: string
  }

  if (
    typeof sessionUser.userId === "number" &&
    Number.isFinite(sessionUser.userId) &&
    sessionUser.userId > 0
  ) {
    return sessionUser.userId
  }

  const username = sessionUser.username
  if (username) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })
    if (user) return user.id
  }

  const email = session.user.email
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (user) return user.id
  }

  return null
}
