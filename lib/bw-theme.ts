/** Black Waves — shared panel & text classes (dark glass on wave background) */
export const bw = {
  panel:
    "rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)]",
  panelHover: "transition-all hover:border-white/20",
  title: "font-bold text-white",
  subtitle: "text-sm text-white/55",
  muted: "text-white/55",
  body: "text-white/90",
  navItem:
    "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors text-white/75 hover:bg-white/10 hover:text-white",
  navItemActive: "bg-white text-black hover:bg-white hover:text-black",
  divider: "border-white/10",
  iconMuted: "text-white/25",
  innerPanel: "rounded-lg border border-white/10 bg-white/5",
  adminSidebar:
    "flex flex-col border-r border-white/10 bg-black/90 backdrop-blur-xl transition-all duration-300",
  adminNavItem:
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-white/70 hover:bg-white/10 hover:text-white",
  adminNavItemActive: "bg-white/15 text-white",
  adminPageTitle: "text-2xl font-bold text-white",
  adminPageSubtitle: "text-sm text-white/55",
  adminCard: "rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)]",
  adminTable: "overflow-hidden rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl",
  adminTableHead: "border-b border-white/10 bg-white/5",
  adminTh: "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/45",
  adminRow: "transition-colors hover:bg-white/5",
  adminInput:
    "w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition-all focus:border-white/30 focus:ring-2 focus:ring-white/10",
  adminInputPlain:
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-all focus:border-white/30 focus:ring-2 focus:ring-white/10",
  adminSelect:
    "bw-admin-select w-full cursor-pointer rounded-xl border border-white/20 bg-[#0a0a0a] px-4 py-3 text-sm font-semibold text-white outline-none transition-all focus:border-white/40 focus:ring-2 focus:ring-white/10 scheme-dark",
  adminBtnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50",
  adminBtnGhost:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-[0.98]",
  adminFilterActive: "rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black",
  adminFilterIdle:
    "rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
  adminIconBox:
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white",
  adminLabel: "text-xs font-bold uppercase tracking-wider text-white/45",
  adminSpinner: "h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white",

  /** Black Waves — หน้าร้าน / หมวดหมู่ / สินค้าในหมวด (ขาว + glass ไม่ใช้แดง) */
  pageTitle: "text-2xl font-bold tracking-tight text-white md:text-3xl",
  pageSubtitle: "text-sm font-normal text-white/50",
  zoneTitle:
    "text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl",
  zoneSubtitle: "mt-2 text-sm font-medium text-white/55",
  iconRing:
    "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/90 backdrop-blur-md",
  storeCard:
    "overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)]",
  storeCardHover:
    "transition-all duration-300 hover:border-white/25 hover:shadow-[0_0_32px_rgba(255,255,255,0.08)] group-hover:border-white/30",
  storeCardFooter:
    "flex flex-col gap-2 border-t border-white/10 bg-black/70 px-4 py-4 backdrop-blur-md sm:px-5",
  storeOverlay:
    "store-category-banner-overlay pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300",
  storeOverlayColor: "rgb(204, 0, 0)",
  storeBannerImg:
    "store-category-banner-img absolute inset-0 h-full w-full object-contain object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
  productWatermark:
    "select-none font-black uppercase leading-none text-white/20 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]",
  bannerLabel:
    "text-xs font-bold uppercase tracking-widest text-white/90 drop-shadow-md sm:text-sm",
  breadcrumbLink: "text-white/55 transition-colors hover:text-white",
  breadcrumbCurrent: "font-medium text-white",
  featuredBadge:
    "inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-bold text-white/90",
  productCard:
    "group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] transition-all hover:border-white/25 hover:shadow-[0_0_24px_rgba(255,255,255,0.05)]",
  storeBtn:
    "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-colors sm:text-sm",
  storeBtnPrimary:
    "bg-white text-black hover:bg-white/90 active:scale-[0.98]",
  storeBtnDisabled: "bg-white/10 text-white/40",
  storeSpinner:
    "h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white",
  linkAccent:
    "text-white/70 transition-colors hover:text-white hover:underline",
  zoneName: "text-sm font-bold uppercase tracking-wide text-white",
  storeLinkMuted:
    "text-xs font-medium text-white/50 transition-colors group-hover:text-white/80",
} as const
