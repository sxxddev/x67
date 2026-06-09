"use client"

import { useEffect, useRef } from "react"

const PROJECT_ID =
  process.env.NEXT_PUBLIC_UNICORN_PROJECT_ID ?? "N9XzvQXu7fA5SY2ewADJ"

const SCRIPT_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.30/dist/unicornStudio.umd.js"

declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized?: boolean
      init?: () => void
    }
  }
}

/**
 * Black Waves — embed ตรงตาม backseasy (ไม่ใช้ iframe)
 */
export function UnicornWavesBackground() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_UNICORN_BG === "false") return

    const mount = rootRef.current
    if (!mount) return
    const mountEl = mount
    if (!mountEl.id) mountEl.id = "unicorn-bg-frame"
    mountEl.setAttribute("data-us-project", PROJECT_ID)

    let cancelled = false

    const mountScene = () => {
      if (cancelled) return
      if (!window.UnicornStudio) {
        window.UnicornStudio = { isInitialized: false }
      }
      if (window.UnicornStudio.isInitialized) return

      // Lock Unicorn mouse-tracking so the background does not sway with cursor.
      const originalWindowAdd = window.addEventListener.bind(window)
      const originalDocumentAdd = document.addEventListener.bind(document)
      const blockedTypes = new Set([
        "mousemove",
        "pointermove",
        "touchmove",
        "wheel",
      ])

      const shouldBlock = (type: string) => blockedTypes.has(type)

      window.addEventListener = ((
        type: string,
        listener: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions
      ) => {
        if (shouldBlock(type)) return
        return originalWindowAdd(type, listener as EventListener, options)
      }) as typeof window.addEventListener

      document.addEventListener = ((
        type: string,
        listener: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions
      ) => {
        if (shouldBlock(type)) return
        return originalDocumentAdd(type, listener as EventListener, options)
      }) as typeof document.addEventListener

      window.UnicornStudio.init?.()

      // Restore native addEventListener shortly after Unicorn init hook.
      window.setTimeout(() => {
        window.addEventListener = originalWindowAdd
        document.addEventListener = originalDocumentAdd
      }, 1500)

      window.UnicornStudio.isInitialized = true
    }

    function loadScript() {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${SCRIPT_SRC}"]`
      )
      if (existing) {
        if (existing.dataset.loaded === "true") {
          mountScene()
        } else {
          existing.addEventListener(
            "load",
            () => {
              mountScene()
            },
            { once: true }
          )
        }
        return
      }

      const script = document.createElement("script")
      script.src = SCRIPT_SRC
      script.async = true
      script.dataset.unicornStudio = "true"
      script.onload = () => {
        script.dataset.loaded = "true"
        mountScene()
      }
      document.head.appendChild(script)
    }

    const start = () => {
      requestAnimationFrame(() => requestAnimationFrame(loadScript))
    }

    if (document.readyState === "complete") start()
    else window.addEventListener("load", start, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener("load", start)
    }
  }, [])

  if (process.env.NEXT_PUBLIC_ENABLE_UNICORN_BG === "false") {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-black"
        aria-hidden
      />
    )
  }

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-[2] overflow-hidden [&_canvas]:!absolute [&_canvas]:!left-1/2 [&_canvas]:!top-0 [&_canvas]:!h-[118%] [&_canvas]:!w-full [&_canvas]:!max-w-none [&_canvas]:-translate-x-1/2 [&_canvas]:object-cover [&_canvas]:object-[center_22%]"
      aria-hidden
    />
  )
}
