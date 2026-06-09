"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { AnimatePresence, motion } from "motion/react"
import { usePathname, useRouter } from "next/navigation"
import {
  getPageTransitionKey,
  getPageTransitionTiming,
  isAnimatedInternalPath,
  registerPageTransitionNavigate,
} from "@/lib/page-transition-nav"

const ease = [0.22, 1, 0.36, 1] as const

type PageTransitionContextValue = {
  navigate: (href: string) => void
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null
)

export function usePageTransition() {
  return useContext(PageTransitionContext)
}

function showOverlay() {
  document.getElementById("site-route-overlay")?.classList.add("is-active")
}

function hideOverlay() {
  document.getElementById("site-route-overlay")?.classList.remove("is-active")
}

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname() ?? "/"
  const transitionKey = getPageTransitionKey(pathname)
  const [mounted, setMounted] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const busyRef = useRef(false)
  const skipPathOverlayRef = useRef(true)

  const [renderKey, setRenderKey] = useState(transitionKey)
  const [cachedChildren, setCachedChildren] = useState(children)
  const pendingChildrenRef = useRef<ReactNode>(null)

  const animatedRoute = isAnimatedInternalPath(pathname)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    if (transitionKey === renderKey) {
      setCachedChildren(children)
      return
    }
    pendingChildrenRef.current = children
    setRenderKey(transitionKey)
  }, [transitionKey, children, renderKey])

  const handleExitComplete = useCallback(() => {
    if (pendingChildrenRef.current != null) {
      setCachedChildren(pendingChildrenRef.current)
      pendingChildrenRef.current = null
    }
  }, [])

  const navigate = useCallback(
    (href: string) => {
      const pathOnly = href.split("?")[0].split("#")[0] || "/"

      if (!isAnimatedInternalPath(pathOnly)) {
        router.push(href)
        return
      }

      if (!mounted || reduceMotion) {
        router.push(href)
        return
      }

      if (busyRef.current) return
      busyRef.current = true
      const { exitMs, enterMs } = getPageTransitionTiming(pathOnly)
      const totalMs = exitMs + enterMs + 80
      showOverlay()
      router.push(href)

      window.setTimeout(() => {
        busyRef.current = false
        hideOverlay()
      }, totalMs)
    },
    [mounted, reduceMotion, router]
  )

  useEffect(() => {
    registerPageTransitionNavigate(navigate)
    return () => registerPageTransitionNavigate(null)
  }, [navigate])

  useEffect(() => {
    if (!mounted || reduceMotion || !animatedRoute) return
    if (skipPathOverlayRef.current) {
      skipPathOverlayRef.current = false
      return
    }
    const { exitMs, enterMs } = getPageTransitionTiming(pathname)
    showOverlay()
    const id = window.setTimeout(() => hideOverlay(), exitMs + enterMs + 80)
    return () => window.clearTimeout(id)
  }, [pathname, mounted, reduceMotion, animatedRoute])

  const useMotion = mounted && !reduceMotion && animatedRoute
  const { exitMs, enterMs } = getPageTransitionTiming(pathname)

  const content = useMotion ? (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={handleExitComplete}
    >
      <motion.div
        key={renderKey}
        className="app-page-root min-h-screen w-full"
        initial={{ opacity: 0, y: 28 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: enterMs / 1000, ease },
        }}
        exit={{
          opacity: 0,
          y: -20,
          transition: { duration: exitMs / 1000, ease },
        }}
      >
        {cachedChildren}
      </motion.div>
    </AnimatePresence>
  ) : (
    <div className="app-page-root min-h-screen w-full">{children}</div>
  )

  return (
    <PageTransitionContext.Provider value={{ navigate }}>
      {content}
    </PageTransitionContext.Provider>
  )
}
