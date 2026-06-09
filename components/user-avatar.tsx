import { cn } from "@/lib/utils"

type UserAvatarProps = {
  className?: string
  iconClassName?: string
  /** จุดสถานะออนไลน์ (มุมล่างขวา) */
  showOnlineDot?: boolean
}

/** อวาตาร์ผู้ใช้มาตรฐาน — วงกลมเทา + ไอคอน user (fa-solid fa-user) */
export function UserAvatar({
  className,
  iconClassName,
  showOnlineDot = false,
}: UserAvatarProps) {
  return (
    <div
      className={cn("relative inline-flex shrink-0", className)}
      aria-hidden
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full",
          "border border-white/10 bg-zinc-700 text-white",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        )}
      >
        <i
          className={cn("fa-solid fa-user leading-none", iconClassName ?? "text-sm")}
          aria-hidden
        />
      </div>
      {showOnlineDot ? (
        <span
          className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-zinc-900 bg-emerald-500"
          aria-hidden
        />
      ) : null}
    </div>
  )
}
