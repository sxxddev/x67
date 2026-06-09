"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useStore, type User } from "@/lib/store"

type SessionUser = {
  userId?: number
  username?: string | null
  email?: string | null
  name?: string | null
  image?: string | null
  balance?: number
  role?: string
}

/** ซิงค์ข้อมูลจาก NextAuth → Zustand ให้ตรงกับ navbar */
export function ProfileSessionSync() {
  const { data: session, status } = useSession()
  const setUser = useStore((s) => s.setUser)

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      if (status === "unauthenticated") setUser(null)
      return
    }

    const su = session.user as SessionUser
    const id =
      typeof su.userId === "number" && su.userId > 0
        ? su.userId
        : undefined

    if (!id && !su.username) return

    const mapped: User = {
      id: id ?? 0,
      username: su.username ?? null,
      email: su.email ?? null,
      name: su.name ?? null,
      image: su.image ?? null,
      balance: typeof su.balance === "number" ? su.balance : 0,
      points: 0,
      role: su.role ?? "USER",
    }

    setUser(mapped)

    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.user) return
        setUser({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          name: data.user.name,
          image: data.user.image,
          balance: data.user.balance,
          points: data.user.points,
          role: data.user.role,
        })
      })
      .catch(() => {})
  }, [session, status, setUser])

  return null
}
