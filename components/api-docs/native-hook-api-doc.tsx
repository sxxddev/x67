"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { CodeWindow } from "@/components/api-docs/code-window"
import { cn } from "@/lib/utils"

const NAV_SECTIONS = [
  { id: "sec-overview", label: "ภาพรวม" },
  { id: "sec-hooknative", label: "ดักจับ Native" },
  { id: "sec-getargs", label: "อ่านค่า Arguments" },
  { id: "sec-setargs", label: "แก้ไข Arguments" },
  { id: "sec-vector3", label: "พิกัด 3 มิติ" },
  { id: "sec-return", label: "ค่าที่ส่งกลับ" },
  { id: "sec-examples", label: "ตัวอย่างการใช้งาน" },
] as const

const INIT_CMD = 'x67SECRETME.init("native-hook-api")'

const CODE = {
  hookExample: `-- Hook Native ด้วย Hash
x67SECRETME.hooknative(0xHASHVALUE, function(ctx)
    print("Native intercepted!")

    -- อ่าน Argument แรกเป็น Integer
    local arg0 = ctx:GetInt(0)
    print("Arg[0] = " .. arg0)

    return true
end)`,
  vector3Example: `-- เปลี่ยนพิกัดปลายทางก่อนเทเลพอร์ต
x67SECRETME.hooknative(0x12345678, function(ctx)
    local dest = ctx:GetVector3(0)

    -- เลื่อนพิกัดขึ้น 1.0
    dest.x = dest.x + 1.0
    dest.y = dest.y + 1.0

    ctx:SetVector3(0, dest)
    return true
end)`,
  weaponHook: `-- ดักจับ GIVE_WEAPON_TO_PED แล้วแก้ไข Arguments
x67SECRETME.hooknative(0xBF0FD6E56C964FCB, function(ctx)
    local ped        = ctx:GetInt(0)
    local weaponHash = ctx:GetUInt(1)
    local ammo       = ctx:GetInt(2)

    print("[Hook] Weapon: " .. weaponHash .. " Ammo: " .. ammo)

    -- เพิ่มกระสุนเป็น 2 เท่า
    ctx:SetInt(2, ammo * 2)

    return true
end)`,
  overrideReturn: `-- Override Return Value แบบ Vector3
x67SECRETME.hooknative(0x3FEF770D40960D5A, function(ctx)
    local fake = Vector3.new(1000.0, 1000.0, 100.0)
    ctx:SetReturnVector3(fake)
    return false
end)`,
  block: `-- บล็อค Native ทั้งหมด
x67SECRETME.hooknative(0x00123454, function(ctx)
    return false
end)`,
  unhook: `-- ลบ Hook ออกทั้งหมด
x67SECRETME.unhook(0xBF0FD6E56C964FCB)
print("[Unhook] กลับสู่พฤติกรรมปกติแล้ว")`,
} as const

function SectionTag({ children }: { children: ReactNode }) {
  return (
    <span className="mr-2 inline-block rounded border border-cyan-400/40 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#22d3ee]">
      {children}
    </span>
  )
}

function ApiH2({
  tag,
  children,
}: {
  tag: string
  children: ReactNode
}) {
  return (
    <h2 className="mb-3 text-xl font-semibold text-white md:text-2xl">
      <SectionTag>{tag}</SectionTag>
      {children}
    </h2>
  )
}

function ApiH3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 mt-6 text-base font-medium text-white/90">{children}</h3>
  )
}

function ApiDesc({ children }: { children: ReactNode }) {
  return (
    <p className="mb-5 text-sm leading-relaxed text-white/60 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-[#22d3ee]">
      {children}
    </p>
  )
}

function ApiSig({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 overflow-x-auto rounded-lg border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white/80 backdrop-blur">
      {children}
    </div>
  )
}

function ApiTable({
  headers,
  rows,
}: {
  headers: [string, string, string]
  rows: { param: string; type: string; desc: string }[]
}) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-white/10 bg-black/50 backdrop-blur">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-white/45"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.param}
              className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
            >
              <td className="px-4 py-2.5 font-mono text-xs text-[#22d3ee]">
                {row.param}
              </td>
              <td className="px-4 py-2.5">
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white/70">
                  {row.type}
                </span>
              </td>
              <td className="px-4 py-2.5 text-white/55">{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReturnCard({
  variant,
  label,
  desc,
}: {
  variant: "true" | "false"
  label: string
  desc: string
}) {
  const isTrue = variant === "true"
  return (
    <div className="mb-3 flex items-start gap-3 rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold",
          isTrue
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-red-500/15 text-red-400"
        )}
      >
        {isTrue ? "✓" : "✗"}
      </div>
      <div>
        <div className="font-mono text-sm font-medium text-white">{label}</div>
        <div className="mt-0.5 text-sm text-white/55">{desc}</div>
      </div>
    </div>
  )
}

function SectionDivider() {
  return <div className="my-10 h-px bg-white/10" aria-hidden />
}

function TerminalHero() {
  const [typed, setTyped] = useState("")
  const [showOutput, setShowOutput] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i += 1
      setTyped(INIT_CMD.slice(0, i))
      if (i >= INIT_CMD.length) {
        clearInterval(interval)
        setShowCursor(false)
        setTimeout(() => setShowOutput(true), 200)
      }
    }, 45)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)] backdrop-blur">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        <span className="ml-2 font-mono text-xs text-white/45">
          x67secretme-api — bash
        </span>
      </div>
      <div className="space-y-1 p-4 font-mono text-sm leading-relaxed">
        <div className="text-white/90">
          <span className="text-[#22d3ee]">$</span>{" "}
          <span className="text-white">{typed}</span>
          {showCursor && (
            <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-[#22d3ee]/80 align-middle" />
          )}
        </div>
        {showOutput && (
          <div className="animate-in fade-in text-white/70 duration-300">
            <br />
            <span className="font-semibold text-[#22d3ee]">
              x67SECRETME Native Hook API
            </span>{" "}
            v2.0
            <br />
            <span className="text-white/50">Status: </span>
            <span className="text-emerald-400">● Active</span>
            <br />
            <span className="text-white/50">Updated: December 2025</span>
            <br />
            <br />
            <span className="text-white/55">
              ดักจับ แก้ไข และควบคุม Native Calls แบบ Real-time
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function useScrollSpy(sectionIds: readonly string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0])
  const ratiosRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    const ratios = ratiosRef.current
    sectionIds.forEach((id) => ratios.set(id, 0))

    const pickActive = () => {
      let best = sectionIds[0]
      let bestRatio = -1
      for (const id of sectionIds) {
        const r = ratios.get(id) ?? 0
        if (r > bestRatio) {
          bestRatio = r
          best = id
        }
      }
      if (bestRatio > 0) setActiveId(best)
    }

    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0)
          })
          pickActive()
        },
        { rootMargin: "-15% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [sectionIds])

  return activeId
}

export function NativeHookApiDoc() {
  const sectionIds = NAV_SECTIONS.map((s) => s.id)
  const activeId = useScrollSpy(sectionIds)

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      {/* Mobile nav */}
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {NAV_SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className={cn(
              "shrink-0 rounded-lg border px-3 py-1.5 text-xs transition",
              activeId === id
                ? "border-[#22d3ee]/50 bg-[#22d3ee]/10 text-[#22d3ee]"
                : "border-white/10 bg-black/50 text-white/60 hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden w-[220px] shrink-0 lg:block">
        <div className="sticky top-24 rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/35">
            Navigation
          </div>
          <ul className="space-y-0.5">
            {NAV_SECTIONS.map(({ id, label }) => {
              const isActive = activeId === id
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition",
                      isActive
                        ? "bg-[#22d3ee]/10 text-[#22d3ee]"
                        : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    {isActive && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22d3ee]" />
                    )}
                    <span className={cn(!isActive && "pl-3.5")}>{label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-0">
        {/* Overview */}
        <section id="sec-overview" className="scroll-mt-24">
          <TerminalHero />

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Hook Functions",
                desc: "ดักจับ Native Function และรับ Callback ควบคุมทุกครั้งที่ถูกเรียก",
                accent: "border-t-[#22d3ee]",
              },
              {
                title: "Modify Arguments",
                desc: "อ่านและแก้ไข Arguments ก่อนที่ Native จะทำงาน",
                accent: "border-t-violet-400",
              },
              {
                title: "Control Returns",
                desc: "Override ผลลัพธ์หรือบล็อก Call ได้อย่างสมบูรณ์",
                accent: "border-t-amber-400",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className={cn(
                  "rounded-xl border border-white/10 border-t-2 bg-black/50 p-4 backdrop-blur",
                  feat.accent
                )}
              >
                <div className="text-sm font-medium text-white">{feat.title}</div>
                <div className="mt-1 text-xs leading-relaxed text-white/50">
                  {feat.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Zero-restart", "Live Patching", "Runtime API"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-3 py-1 text-xs text-[#22d3ee]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90 backdrop-blur">
            <strong>⚠ Note:</strong> CitizenFX (CFX) Natives ไม่สามารถ Hook ได้
            แต่ Game Natives ทั้งหมดสามารถใช้งานได้
          </div>
        </section>

        <SectionDivider />

        {/* hooknative */}
        <section id="sec-hooknative" className="scroll-mt-24">
          <ApiH2 tag="CORE">x67SECRETME.hooknative</ApiH2>
          <ApiDesc>
            Hook Native ด้วย 64-bit Hash และกำหนด Callback เพื่อจัดการการดักจับ —
            Callback จะได้รับ <code>ctx</code> object พร้อม Helpers
          </ApiDesc>

          <ApiSig>
            <span className="text-[#22d3ee]">x67SECRETME.hooknative</span>
            <span className="text-white/40">(</span>
            <span className="text-white/50">integer</span> hash
            <span className="text-white/40">, </span>
            <span className="text-white/50">function</span> callback
            <span className="text-white/40">)</span>
            <span className="text-white/40"> → </span>
            <span className="text-white/50">void</span>
          </ApiSig>

          <ApiTable
            headers={["Parameter", "Type", "Description"]}
            rows={[
              {
                param: "hash",
                type: "number",
                desc: "Native Hash (เช่น 0x7F8F1234)",
              },
              {
                param: "callback",
                type: "function(ctx)",
                desc: "ถูกเรียกทุกครั้งที่ Native ทำงาน",
              },
            ]}
          />

          <CodeWindow filename="hook_example.lua" code={CODE.hookExample} />
        </section>

        <SectionDivider />

        {/* Get Arguments */}
        <section id="sec-getargs" className="scroll-mt-24">
          <ApiH2 tag="READ">อ่านค่า Arguments</ApiH2>
          <ApiDesc>
            อ่าน Arguments จาก <code>ctx</code> object ด้วย Method ตาม Type
          </ApiDesc>

          <ApiTable
            headers={["Method", "Return", "Description"]}
            rows={[
              {
                param: "ctx:GetInt(index)",
                type: "integer",
                desc: "อ่าน Argument เป็น Signed Integer",
              },
              {
                param: "ctx:GetUInt(index)",
                type: "unsigned int",
                desc: "อ่าน Argument เป็น Unsigned Integer",
              },
              {
                param: "ctx:GetFloat(index)",
                type: "float",
                desc: "อ่าน Argument เป็น Float",
              },
              {
                param: "ctx:GetBool(index)",
                type: "boolean",
                desc: "อ่าน Argument เป็น Boolean",
              },
              {
                param: "ctx:GetVector3(index)",
                type: "Vector3",
                desc: "อ่าน 3 ช่อง (x,y,z) เป็น Vector3",
              },
            ]}
          />
        </section>

        <SectionDivider />

        {/* Set Arguments */}
        <section id="sec-setargs" className="scroll-mt-24">
          <ApiH2 tag="WRITE">แก้ไข Arguments</ApiH2>
          <ApiDesc>แก้ไข Arguments ก่อน Native ทำงานจริง</ApiDesc>

          <ApiTable
            headers={["Method", "Value", "Description"]}
            rows={[
              {
                param: "ctx:SetInt(index, value)",
                type: "integer",
                desc: "เขียนทับ Argument เป็น Integer",
              },
              {
                param: "ctx:SetUInt(index, value)",
                type: "unsigned int",
                desc: "เขียนทับ Argument เป็น Unsigned Int",
              },
              {
                param: "ctx:SetFloat(index, value)",
                type: "float",
                desc: "เขียนทับ Argument เป็น Float",
              },
              {
                param: "ctx:SetBool(index, value)",
                type: "boolean",
                desc: "เขียนทับ Argument เป็น Boolean",
              },
              {
                param: "ctx:SetVector3(index, vec)",
                type: "Vector3",
                desc: "เขียนทับ 3 ช่อง ด้วย Vector3",
              },
            ]}
          />
        </section>

        <SectionDivider />

        {/* Vector3 */}
        <section id="sec-vector3" className="scroll-mt-24">
          <ApiH2 tag="3D">พิกัด 3 มิติ (Vector3)</ApiH2>
          <ApiDesc>สร้างและจัดการ Vector3 สำหรับพิกัด 3 มิติ</ApiDesc>

          <ApiTable
            headers={["Method / Field", "Type", "Description"]}
            rows={[
              {
                param: "Vector3.new(x, y, z)",
                type: "Vector3",
                desc: "สร้าง Vector3 ใหม่",
              },
              { param: "vec.x", type: "float", desc: "ค่าแกน X" },
              { param: "vec.y", type: "float", desc: "ค่าแกน Y" },
              { param: "vec.z", type: "float", desc: "ค่าแกน Z" },
            ]}
          />

          <CodeWindow filename="vector3_example.lua" code={CODE.vector3Example} />
        </section>

        <SectionDivider />

        {/* Return Values */}
        <section id="sec-return" className="scroll-mt-24">
          <ApiH2 tag="CTRL">ค่าที่ส่งกลับ (Return)</ApiH2>
          <ApiDesc>
            ค่าที่ return จาก Callback ควบคุมว่า Native ต้นฉบับจะทำงานหรือไม่
          </ApiDesc>

          <ReturnCard
            variant="true"
            label="return true"
            desc="ให้ Native ทำงานต่อตามปกติ (อาจใช้ Arguments ที่แก้ไขแล้ว)"
          />
          <ReturnCard
            variant="false"
            label="return false"
            desc="บล็อก Native — ไม่ให้ทำงานเลย"
          />

          <ApiH3>Override Return Value</ApiH3>
          <ApiTable
            headers={["Method", "Type", "Description"]}
            rows={[
              {
                param: "ctx:SetReturnInt(value)",
                type: "integer",
                desc: "Override ค่า Return เป็น Int",
              },
              {
                param: "ctx:SetReturnFloat(value)",
                type: "float",
                desc: "Override ค่า Return เป็น Float",
              },
              {
                param: "ctx:SetReturnBool(value)",
                type: "boolean",
                desc: "Override ค่า Return เป็น Bool",
              },
              {
                param: "ctx:SetReturnVector3(vec)",
                type: "Vector3",
                desc: "Override ค่า Return เป็น Vector3",
              },
            ]}
          />
        </section>

        <SectionDivider />

        {/* Examples */}
        <section id="sec-examples" className="scroll-mt-24 pb-8">
          <ApiH2 tag="EX">ตัวอย่างการใช้งาน</ApiH2>
          <ApiDesc>ตัวอย่างการใช้งานจริง</ApiDesc>

          <ApiH3>01 — ดักจับและแก้ไข Arguments</ApiH3>
          <CodeWindow filename="weapon_hook.lua" code={CODE.weaponHook} className="mb-6" />

          <ApiH3>02 — Override Return Value + Block</ApiH3>
          <CodeWindow
            filename="override_return.lua"
            code={CODE.overrideReturn}
            className="mb-6"
          />

          <ApiH3>03 — Block Native</ApiH3>
          <CodeWindow filename="block.lua" code={CODE.block} className="mb-6" />

          <ApiH3>04 — Unhook</ApiH3>
          <CodeWindow filename="unhook.lua" code={CODE.unhook} />
        </section>
      </div>
    </div>
  )
}
