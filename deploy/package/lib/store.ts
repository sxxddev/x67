import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  discount?: number
  image: string | null
  categoryId: string
  categoryName: string
  stock: number
  isUnlimited: boolean
  pointsEarn: number
  isHot: boolean
  badge?: string | null
  isActive: boolean
}

export interface ProductWithCategory extends Product {
  category: {
    id: string
    name: string
    icon?: string | null
  }
}

export interface User {
  id: number
  username: string | null
  email: string | null
  name: string | null
  image: string | null
  balance: number
  points: number
  role: string
}

export interface StockItem {
  id: string
  accountEmail: string
  accountPass: string
  accountData?: string | null
}

export interface LicenseKeyItem {
  id: string
  key: string
  status: "ACTIVE" | "REVOKED" | "EXPIRED"
  expiresAt: string | null
  hwid: string | null
}

export interface OrderHistory {
  id: number
  productId: string
  productName: string
  productImage: string | null
  price: number
  quantity: number
  totalPrice: number
  pointsEarned: number
  pointsUsed: number
  couponDiscount: number
  status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED"
  createdAt: string
  stockItems?: StockItem[]
  licenseKeys?: LicenseKeyItem[]
}

export interface TopupHistory {
  id: number
  amount: number
  method: string
  slipImage?: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  adminNote?: string | null
  createdAt: string
}

export interface Coupon {
  id: string
  code: string
  type: "PERCENT" | "FIXED"
  value: number
  minPurchase: number
  maxDiscount?: number | null
  isValid: boolean
  discount?: number
}

interface StoreState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  updateBalance: (amount: number) => void
  updatePoints: (amount: number) => void
  logout: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateBalance: (amount) => {
        set((state) => ({
          user: state.user ? { ...state.user, balance: state.user.balance + amount } : null,
        }))
      },
      updatePoints: (amount) => {
        set((state) => ({
          user: state.user ? { ...state.user, points: state.user.points + amount } : null,
        }))
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'webshop-storage',
    }
  )
)

// Helper functions
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH').format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function calculateDiscount(price: number, discount?: number | null): number {
  if (!discount) return price
  return price - (price * discount / 100)
}
