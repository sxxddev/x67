# ระบบสั่งอาหาร Mini Program

ระบบสั่งอาหารออนไลน์: ฝั่ง Mini Program + Backend Node.js + Docker

## เริ่มต้นใช้งาน

### 1. ตั้งค่า environment

```bash
cd server
copy .env.example .env
```

แก้ไข `.env` ใส่ AppID, Secret ของ WeChat และข้อมูลชำระเงิน

### 2. เปิดเซิร์ฟเวอร์

**Docker (แนะนำ):**

```bash
docker-compose up -d
```

**พัฒนาบนเครื่อง:**

```bash
cd server
npm install
npm run dev
```

### 3. เปิด Mini Program

1. WeChat Developer Tools → Import → เลือกโฟลเดอร์ `miniprogram`
2. แก้ `miniprogram/utils/config.js` ที่ `apiBaseUrl`
3. โหมด dev: เปิด "ไม่ตรวจสอบโดเมน"

## ฟีเจอร์

- ล็อกอิน WeChat
- รายการสินค้า / รายละเอียด
- ตะกร้า
- สั่งซื้อ / ประวัติออเดอร์
- ชำระเงิน WeChat Pay
- ที่อยู่จัดส่ง

## API

| Method | Path | คำอธิบาย |
|--------|------|----------|
| POST | /api/auth/login | ล็อกอิน WeChat |
| GET | /api/products | รายการสินค้า |
| GET | /api/products/:id | รายละเอียดสินค้า |
| GET | /api/stores | รายการร้าน |
| POST | /api/orders | สร้างออเดอร์ |
| GET | /api/orders | ออเดอร์ของฉัน |
| GET | /api/orders/:id | รายละเอียดออเดอร์ |
| POST | /api/payment/create | เริ่มชำระเงิน |
| POST | /api/payment/notify | callback ชำระเงิน |
| GET/POST/PUT/DELETE | /api/addresses | จัดการที่อยู่ |

## โครงสร้าง

```
food-delivery-miniapp/
├── server/           # Express + MySQL
├── miniprogram/      # WeChat Mini Program
└── docker-compose.yml
```
