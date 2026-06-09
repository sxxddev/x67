"use client"

import { useEffect, useState } from "react"
import { SITE_BRAND_NAME } from "@/lib/brand"

export function Preloader() {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Preload currently rendered images without relying on removed mock data.
    const preloadImages = () => {
      const images = Array.from(document.images)
      const imagePromises = images.map((imgEl) => {
        return new Promise<void>((resolve) => {
          const img = new Image()
          img.src = imgEl.src
          img.onload = () => resolve()
          img.onerror = () => resolve() // Don't fail on error
        })
      })
      return Promise.all(imagePromises)
    }

    // Start preloading and set minimum display time
    const minDisplayTime = new Promise<void>((resolve) => setTimeout(resolve, 400))
    
    Promise.all([preloadImages(), minDisplayTime]).then(() => {
      setFadeOut(true)
      setTimeout(() => setLoading(false), 300)
    })
  }, [])

  if (!loading) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-300 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-white/20" />
          <div className="absolute left-0 top-0 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
        <span className="text-base font-bold text-white sm:text-lg">{SITE_BRAND_NAME}</span>
      </div>
    </div>
  )
}
