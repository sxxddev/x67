"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { BrandLogo } from "@/components/brand-logo"
import { signIn } from "next-auth/react"
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react"
import { motion, AnimatePresence, LayoutGroup } from "motion/react"
import { SITE_BRAND_NAME } from "@/lib/brand"
import { cn } from "@/lib/utils"

type AuthTab = "login" | "register"

const premiumEase = [0.22, 1, 0.36, 1] as const

function AuthField({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  trailing,
}: {
  icon: typeof User
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  trailing?: React.ReactNode
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 text-white/35">
        <Icon size={15} strokeWidth={2} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-[10px] border border-white/[0.06] bg-white/[0.024] py-0 pl-9 pr-10 text-sm font-normal text-white outline-none transition-[border-color,box-shadow,background] placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.04] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]"
      />
      {trailing && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>
      )}
    </div>
  )
}

export function AuthModal() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const authParam = searchParams.get("auth")

  const isOpen = authParam === "login" || authParam === "register"
  const tab: AuthTab = authParam === "register" ? "register" : "login"

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  const showModal = isOpen && !pathname?.startsWith("/admin")

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("auth")
    const q = params.toString()
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false })
    setError("")
    setSuccess("")
  }, [pathname, router, searchParams])

  const openTab = useCallback(
    (next: AuthTab) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("auth", next)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
      setError("")
      setSuccess("")
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [isOpen, close])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      })
      if (res?.error) {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
      } else {
        const next = searchParams.get("next")
        const params = new URLSearchParams(searchParams.toString())
        params.delete("auth")
        params.delete("next")
        const q = params.toString()
        if (next && next.startsWith("/")) {
          router.push(q ? `${next}?${q}` : next)
        } else {
          router.push(q ? `${pathname}?${q}` : pathname, { scroll: false })
        }
        router.refresh()
        setError("")
        setSuccess("")
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "การสมัครสมาชิกล้มเหลว")
        return
      }
      setPassword("")
      setConfirmPassword("")
      setSuccess("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ")
      openTab("login")
    } catch {
      setError("เกิดข้อผิดพลาดในการสมัครสมาชิก")
    } finally {
      setIsLoading(false)
    }
  }

  const panelMotion = reduceMotion
    ? { duration: 0.15 }
    : {
        type: "spring" as const,
        stiffness: 420,
        damping: 34,
        mass: 0.88,
      }

  const sectionEnter = reduceMotion
    ? { duration: 0 }
    : { duration: 0.38, ease: premiumEase }

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          key="auth-modal-layer"
          className="fixed inset-0 z-[100001] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.28, ease: premiumEase }}
        >
          <motion.button
            type="button"
            aria-label="ปิด"
            className="absolute inset-0 bg-black/55 backdrop-blur-md"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.34, ease: premiumEase }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-[400px] overflow-hidden rounded-[14px] border border-white/[0.06] bg-[rgba(10,10,12,0.92)] text-white shadow-[inset_2px_4px_16px_0_rgba(248,248,248,0.05),0_30px_60px_-20px_rgba(0,0,0,0.85)] backdrop-blur-[24px] backdrop-saturate-[140%]"
            onClick={(e) => e.stopPropagation()}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.9, y: 36 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.94, y: 20 }
            }
            transition={panelMotion}
          >
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-14 h-60 w-60 rounded-full"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)",
          }}
        />

        <motion.button
          type="button"
          aria-label="ปิด"
          onClick={close}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...sectionEnter, delay: reduceMotion ? 0 : 0.12 }}
        >
          <X size={16} />
        </motion.button>

        <motion.div
          className="relative px-7 pb-4 pt-9 text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sectionEnter, delay: reduceMotion ? 0 : 0.06 }}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <BrandLogo
              width={64}
              height={64}
              className="h-16 w-16"
              priority
            />
          </div>
          <h2 className="text-[22px] font-normal tracking-tight">
            {tab === "login" ? "ยินดีต้อนรับกลับมา" : "สร้างบัญชีใหม่"}
          </h2>
          <p className="mt-1.5 text-[13px] text-white/45">
            {tab === "login"
              ? `เข้าสู่ ${SITE_BRAND_NAME}`
              : `สมัครสมาชิก ${SITE_BRAND_NAME}`}
          </p>
        </motion.div>

        <LayoutGroup id="auth-modal-tabs">
          <motion.div
            className="flex border-b border-white/[0.06] px-7"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...sectionEnter, delay: reduceMotion ? 0 : 0.1 }}
          >
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => openTab(t)}
                className={cn(
                  "relative flex-1 py-2.5 text-[13px] font-normal transition-colors duration-200",
                  tab === t ? "text-white" : "text-white/45 hover:text-white/70"
                )}
              >
                {t === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                {tab === t && (
                  <motion.span
                    layoutId="auth-tab-indicator"
                    className="absolute bottom-0 left-1/4 right-1/4 h-[1.5px] rounded-sm bg-white"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 32,
                      mass: 0.8,
                    }}
                  />
                )}
              </button>
            ))}
          </motion.div>
        </LayoutGroup>

        <motion.div
          className="relative px-7 py-5"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sectionEnter, delay: reduceMotion ? 0 : 0.14 }}
        >
          {success && (
            <p className="mb-3 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-center text-xs text-white/80">
              {success}
            </p>
          )}
          {error && (
            <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">
              {error}
            </p>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {tab === "login" ? (
            <motion.form
              key="login"
              onSubmit={handleLogin}
              className="flex flex-col gap-3.5"
              autoComplete="off"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: premiumEase }}
            >
              <AuthField
                icon={User}
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={setUsername}
                autoComplete="username"
              />
              <AuthField
                icon={Lock}
                type={showPassword ? "text" : "password"}
                placeholder="รหัสผ่าน"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/35 transition hover:text-white/70"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />
              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 inline-flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-white/20 bg-white text-sm font-normal text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:bg-white/90 disabled:opacity-60"
              >
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                {!isLoading && <ArrowRight size={14} />}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              onSubmit={handleRegister}
              className="flex flex-col gap-3.5"
              autoComplete="off"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: premiumEase }}
            >
              <AuthField
                icon={User}
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={setUsername}
                autoComplete="username"
              />
              <AuthField
                icon={Mail}
                type="email"
                placeholder="อีเมล"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />
              <AuthField
                icon={Lock}
                type={showPassword ? "text" : "password"}
                placeholder="รหัสผ่าน"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/35 transition hover:text-white/70"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />
              <AuthField
                icon={Lock}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="ยืนยันรหัสผ่าน"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-white/35 transition hover:text-white/70"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />
              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 inline-flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-white/20 bg-white text-sm font-normal text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:bg-white/90 disabled:opacity-60"
              >
                {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
                {!isLoading && <ArrowRight size={14} />}
              </button>
            </motion.form>
          )}
          </AnimatePresence>
        </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
