import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username as string,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordCorrect) {
          return null
        }

        return {
          id: user.id.toString(),
          name: user.username || user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          balance: user.balance,
          image: user.image,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = (user as any).role || "USER"
        token.username = (user as any).username || ""
        token.balance = (user as any).balance || 0
      }
      return token
    },
    async session({ session, token }) {
      if (token?.sub) {
        // Fetch fresh user data from DB to ensure balance and role are always up-to-date
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(token.sub) },
          select: { role: true, balance: true, username: true }
        })

        if (dbUser) {
          ;(session.user as any).role = dbUser.role
          ;(session.user as any).username = dbUser.username || token.username
          ;(session.user as any).balance = dbUser.balance
        } else {
          ;(session.user as any).role = token.role as string
          ;(session.user as any).username = token.username as string
          ;(session.user as any).balance = token.balance as number
        }

        // ไม่ส่ง `id` ไป client — ใช้ `userId` (ตัวเลข) สำหรับ API ฝั่งเซิร์ฟเวอร์
        const numericId = Number(token.sub)
        if (Number.isFinite(numericId) && numericId > 0) {
          ;(session.user as { userId?: number }).userId = numericId
        }
        if (session.user && "id" in session.user) {
          delete (session.user as { id?: string }).id
        }
      }
      return session
    },
  },
})
