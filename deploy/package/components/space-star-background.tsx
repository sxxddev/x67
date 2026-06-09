"use client"

import { useEffect, useRef } from "react"

type Star = {
  x: number
  y: number
  r: number
  baseAlpha: number
  twinkleSpeed: number
  twinklePhase: number
  vx: number
  vy: number
}

function createStars(count: number, width: number, height: number): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.35 + 0.25,
      baseAlpha: Math.random() * 0.5 + 0.15,
      twinkleSpeed: Math.random() * 0.018 + 0.004,
      twinklePhase: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.06,
      vy: Math.random() * 0.1 + 0.015,
    })
  }
  return stars
}

/**
 * Animated starfield — space theme from index.html (no Unicorn aura).
 */
export function SpaceStarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let stars: Star[] = []
    let animId = 0
    let tick = 0
    let width = 0
    let height = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = createStars(Math.floor((width * height) / 6500), width, height)
    }

    const draw = () => {
      tick += 1
      ctx.clearRect(0, 0, width, height)

      for (const star of stars) {
        star.x += star.vx
        star.y += star.vy
        if (star.x < -4) star.x = width + 4
        if (star.x > width + 4) star.x = -4
        if (star.y < -4) star.y = height + 4
        if (star.y > height + 4) star.y = -4

        const twinkle =
          star.baseAlpha +
          Math.sin(tick * star.twinkleSpeed + star.twinklePhase) * 0.24
        const alpha = Math.max(0.06, Math.min(0.92, twinkle))

        ctx.beginPath()
        if (star.r > 0.9) {
          ctx.shadowBlur = 5
          ctx.shadowColor = `rgba(255,255,255,${alpha * 0.55})`
        } else {
          ctx.shadowBlur = 0
        }
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.shadowBlur = 0
      animId = window.requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener("resize", resize)

    return () => {
      window.cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <>
      {/* Space base — from index.html body::before */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 70% 60%, rgba(255,255,255,0.04) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 50% 90%, rgba(255,255,255,0.03) 0%, transparent 50%),
            linear-gradient(180deg, #0a0a0a 0%, #050505 50%, #0a0a0a 100%)
          `,
        }}
        aria-hidden
      />
      {/* Soft glow — from index.html body::after (not wave aura) */}
      <div
        className="pointer-events-none fixed -right-[10%] -top-[20%] z-0 h-full w-[60%] blur-[60px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[1]"
        aria-hidden
      />
    </>
  )
}
