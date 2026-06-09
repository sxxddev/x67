"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type CodeWindowProps = {
  filename: string
  code: string
  className?: string
}

export function CodeWindow({ filename, code, className }: CodeWindowProps) {
  const [copied, setCopied] = useState(false)
  const lines = code.trimEnd().split("\n")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          <span className="ml-1 font-mono text-xs text-white/45">{filename}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="flex overflow-x-auto">
        <div className="select-none border-r border-white/10 bg-white/[0.02] px-3 py-4 font-mono text-xs leading-6 text-white/25">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 overflow-x-auto p-4 font-mono text-xs leading-6 text-white/85">
          <code>{code.trimEnd()}</code>
        </pre>
      </div>
    </div>
  )
}
