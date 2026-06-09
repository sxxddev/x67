## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** MariaDB + Prisma 7 ORM
- **Auth:** Auth.js v5 (next-auth) — Credentials provider, JWT strategy
- **Styling:** Tailwind CSS 4, shadcn/ui
- **State:** Zustand
- **Package Manager:** pnpm

## Features

- สมัครสมาชิก / เข้าสู่ระบบ
- เรียกดูสินค้าตามหมวดหมู่
- สั่งซื้อสินค้า
- เติมเงินผ่าน PromptPay QR + อัปโหลดสลิป ( ตัวจำลอง )
- ใช้คูปองส่วนลด
- ระบบพอยท์สะสม
- Admin Dashboard — จัดการสินค้า, หมวดหมู่, ผู้ใช้, คำสั่งซื้อ, เติมเงิน, คูปอง

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- MariaDB / MySQL

### Installation

```bash
# Clone & install
pnpm install

# Setup environment
cp .env.example .env
# แก้ไข DATABASE_URL และ AUTH_SECRET ใน .env
```

### Environment Variables

สร้างไฟล์ `.env` ที่ root ของ project:

```env
DATABASE_URL="mysql://user:password@localhost:3306/mq_demo"
AUTH_SECRET="your-secret-key"
```

### Database Setup

```bash
# Sync schema to database
pnpm prisma db push

# Generate Prisma client
pnpm prisma generate
```

### Development

```bash
pnpm dev
```

เปิด [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
app/                  # Next.js App Router pages & API routes
├── admin/            # Admin dashboard pages
├── api/              # REST API endpoints
├── login/            # Login page
├── register/         # Register page
├── store/            # Store, category, product pages
├── profile/          # User profile, orders, topup history
└── topup/            # Top-up page

components/           # React components
├── ui/               # shadcn/ui base components
├── home/             # Homepage sections
├── profile/          # Profile sidebar
├── store/            # Category grid
├── navbar.tsx        # Navigation bar
├── footer.tsx        # Footer
└── product-card.tsx  # Product card

prisma/
└── schema.prisma     # Database schema

lib/
├── prisma.ts         # Prisma client singleton
├── store.ts          # Zustand store
└── utils.ts          # Utility functions
```
